// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPublicLock {
    function getHasValidKey(address _user) external view returns (bool);
}

/// @title PasanakuProtocol
/// @notice Protocolo NO-CUSTODIO de pasanaku (ROSCA) on-chain.
///         - Nadie (ni el owner) puede retirar el pozo: no existe withdrawAll(onlyOwner).
///         - El dinero solo se mueve por reglas: entra por rondas y sale COMPLETO al del turno.
///         - Colateral chico y reembolsable + fondo de seguro + reputación.
///         - Dos modos: SAVINGS (todos aportan cada ronda) y CREDIT (el del turno no aporta).
///         MVP de hackathon, no auditado. Roadmap: auditoría + subasta de turnos.
contract PasanakuProtocol is ReentrancyGuard {
    IERC20 public immutable token; // stablecoin (MockUSDC en Fuji)
    address public feeRecipient;
    /// @notice Unlock PublicLock (C-Chain) o UnlockMock (Fuji / tests). Sin Key no hay join.
    IPublicLock public immutable membershipLock;

    uint256 public constant FEE_BPS = 100; // 1.00% del pozo -> protocolo
    uint256 public constant INSURANCE_BPS = 30; // 0.30% del pozo -> fondo de seguro
    /// @notice 6% de UN pozo se acumula para quien cierra el círculo (el último).
    ///         Lo pagan los que cobran antes, a partes iguales. No es yield de Aave:
    ///         el pozo semanal se va cada ronda; este recorte sí llega al que esperó 30 semanas.
    uint256 public constant LAST_BONUS_BPS = 600;
    uint256 public constant RECOVER_TIMEOUT = 7 days;

    uint256 public insuranceFund; // fondo de seguro on-chain (cubre huecos de default)

    enum Mode {
        SAVINGS,
        CREDIT
    }

    struct Circle {
        address[] members;
        uint256 contribution;
        uint256 collateral; // chico: ej. 2-3 cuotas
        uint256 round;
        uint256 lastAction; // para recover() por timeout
        uint256 lateBonus; // USDC acumulado para el último
        Mode mode;
        bool finished;
        mapping(uint256 => mapping(address => bool)) paid;
        mapping(address => bool) joined;
        mapping(address => bool) hasCollateral;
    }

    uint256 public circleCount;
    mapping(uint256 => Circle) private circles;
    mapping(address => uint256) public withdrawable; // pull-payment
    mapping(address => uint256) public score; // reputación

    event CircleCreated(uint256 indexed id, uint8 mode, uint256 contribution, uint256 collateral);
    event Joined(uint256 indexed id, address indexed member);
    event Contributed(uint256 indexed id, uint256 round, address indexed member);
    event Claimed(uint256 indexed id, uint256 round, address indexed recipient, uint256 net);
    event LateBonusAccrued(uint256 indexed id, uint256 amount, uint256 total);
    event Defaulted(uint256 indexed id, uint256 round, address indexed member);
    event Recovered(uint256 indexed id, address indexed member, uint256 amount);
    event Finished(uint256 indexed id);

    constructor(address _token, address _feeRecipient, address _lock) {
        require(
            _token != address(0) && _feeRecipient != address(0) && _lock != address(0),
            "zero addr"
        );
        token = IERC20(_token);
        feeRecipient = _feeRecipient;
        membershipLock = IPublicLock(_lock);
    }

    // ---------------------------------------------------------------------
    // Creación y entrada
    // ---------------------------------------------------------------------

    function createCircle(
        address[] calldata _members,
        uint256 _contribution,
        uint256 _collateral,
        Mode _mode
    ) external returns (uint256 id) {
        require(_members.length >= 3 && _members.length <= 52, "3-52 members");
        require(_contribution > 0, "contribution=0");
        for (uint256 i; i < _members.length; i++) {
            require(_members[i] != address(0), "zero member");
            for (uint256 j = i + 1; j < _members.length; j++) {
                require(_members[i] != _members[j], "dup member");
            }
        }
        id = circleCount++;
        Circle storage c = circles[id];
        c.members = _members;
        c.contribution = _contribution;
        c.collateral = _collateral;
        c.mode = _mode;
        c.lastAction = block.timestamp;
        emit CircleCreated(id, uint8(_mode), _contribution, _collateral);
    }

    /// @notice Entrar depositando el colateral (reembolsable al terminar limpio).
    ///         Exige membresía Unlock (getHasValidKey).
    function join(uint256 id) external nonReentrant {
        require(membershipLock.getHasValidKey(msg.sender), "no membership");
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(_isMember(c, msg.sender), "not listed");
        require(!c.joined[msg.sender], "already joined");
        c.joined[msg.sender] = true;
        c.hasCollateral[msg.sender] = true;
        c.lastAction = block.timestamp;
        if (c.collateral > 0) {
            require(token.transferFrom(msg.sender, address(this), c.collateral), "collateral fail");
        }
        emit Joined(id, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Aportes y cobro
    // ---------------------------------------------------------------------

    function recipient(uint256 id) public view returns (address) {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        return c.members[c.round];
    }

    function contribute(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(c.joined[msg.sender], "join first");
        require(!c.paid[c.round][msg.sender], "already paid");
        // En CREDIT el del turno no aporta su ronda. En SAVINGS aportan todos.
        if (c.mode == Mode.CREDIT) {
            require(msg.sender != c.members[c.round], "recipient does not pay");
        }
        c.paid[c.round][msg.sender] = true;
        c.lastAction = block.timestamp;
        require(token.transferFrom(msg.sender, address(this), c.contribution), "pay fail");
        emit Contributed(id, c.round, msg.sender);
    }

    function _allPaid(Circle storage c) private view returns (bool) {
        address r = c.members[c.round];
        for (uint256 i; i < c.members.length; i++) {
            address m = c.members[i];
            if (c.mode == Mode.CREDIT && m == r) continue; // en CREDIT el del turno no paga
            if (!c.paid[c.round][m]) return false;
        }
        return true;
    }

    function allPaid(uint256 id) external view returns (bool) {
        return _allPaid(circles[id]);
    }

    /// @notice El del turno cobra el pozo (menos fee, seguro y recorte al bono del último).
    ///         Quien cierra el círculo recibe además lateBonus (~6% de un pozo).
    function claim(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(msg.sender == c.members[c.round], "not your turn");
        require(_allPaid(c), "missing contributions");

        uint256 n = c.members.length;
        uint256 payers = c.mode == Mode.CREDIT ? n - 1 : n;
        uint256 pot = c.contribution * payers;
        uint256 fee = (pot * FEE_BPS) / 10000;
        uint256 insurance = (pot * INSURANCE_BPS) / 10000;
        bool isLast = c.round + 1 == n;

        uint256 skim = 0;
        if (!isLast && n > 1) {
            // 6% de un pozo, repartido entre las rondas tempranas
            skim = (pot * LAST_BONUS_BPS) / (10000 * (n - 1));
            c.lateBonus += skim;
            emit LateBonusAccrued(id, skim, c.lateBonus);
        }

        uint256 net = pot - fee - insurance - skim;
        if (isLast) {
            net += c.lateBonus;
            c.lateBonus = 0;
        }

        withdrawable[msg.sender] += net;
        withdrawable[feeRecipient] += fee;
        insuranceFund += insurance;
        c.lastAction = block.timestamp;
        emit Claimed(id, c.round, msg.sender, net);

        if (isLast) {
            c.finished = true;
            for (uint256 i; i < n; i++) {
                address m = c.members[i];
                if (c.hasCollateral[m]) {
                    c.hasCollateral[m] = false;
                    if (c.collateral > 0) withdrawable[m] += c.collateral;
                    score[m] += 1;
                }
            }
            emit Finished(id);
        } else {
            c.round += 1;
        }
    }

    // ---------------------------------------------------------------------
    // Default y recuperación
    // ---------------------------------------------------------------------

    /// @notice Cubre al del turno con el colateral del que no pagó; el fondo cubre el hueco.
    function markDefault(uint256 id, address defaulter) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(c.mode == Mode.CREDIT, "no default in savings");
        require(c.joined[defaulter], "not member");
        require(defaulter != c.members[c.round], "recipient not payer");
        require(!c.paid[c.round][defaulter], "did pay");
        require(c.hasCollateral[defaulter], "no collateral");

        c.hasCollateral[defaulter] = false;
        c.paid[c.round][defaulter] = true; // se considera cubierto

        address r = c.members[c.round];
        uint256 owed = c.contribution;
        uint256 fromCollateral = owed <= c.collateral ? owed : c.collateral;
        withdrawable[r] += fromCollateral;

        if (owed > fromCollateral) {
            uint256 gap = owed - fromCollateral;
            uint256 cover = gap <= insuranceFund ? gap : insuranceFund;
            if (cover > 0) {
                insuranceFund -= cover;
                withdrawable[r] += cover;
            }
        }

        if (score[defaulter] > 0) score[defaulter] -= 1; // castigo reputación
        c.lastAction = block.timestamp;
        emit Defaulted(id, c.round, defaulter);
    }

    /// @notice Si el círculo se congela, cada quien recupera su colateral tras el timeout.
    function recover(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(block.timestamp > c.lastAction + RECOVER_TIMEOUT, "not stuck yet");
        require(c.hasCollateral[msg.sender], "nothing to recover");
        c.hasCollateral[msg.sender] = false;
        uint256 amount = c.collateral;
        if (amount > 0) withdrawable[msg.sender] += amount;
        emit Recovered(id, msg.sender, amount);
    }

    /// @notice Retira lo acreditado. El dinero sale del contrato a tu wallet.
    function withdraw() external nonReentrant {
        uint256 amt = withdrawable[msg.sender];
        require(amt > 0, "nothing");
        withdrawable[msg.sender] = 0;
        require(token.transfer(msg.sender, amt), "transfer fail");
    }

    // ---------------------------------------------------------------------
    // Vistas (para el SDK / front)
    // ---------------------------------------------------------------------

    function getRound(uint256 id) external view returns (uint256) {
        return circles[id].round;
    }

    function isFinished(uint256 id) external view returns (bool) {
        return circles[id].finished;
    }

    function getMode(uint256 id) external view returns (uint8) {
        return uint8(circles[id].mode);
    }

    function getMembers(uint256 id) external view returns (address[] memory) {
        return circles[id].members;
    }

    function hasPaid(uint256 id, uint256 r, address m) external view returns (bool) {
        return circles[id].paid[r][m];
    }

    function hasJoined(uint256 id, address m) external view returns (bool) {
        return circles[id].joined[m];
    }

    function hasCollateral(uint256 id, address m) external view returns (bool) {
        return circles[id].hasCollateral[m];
    }

    function getLateBonus(uint256 id) external view returns (uint256) {
        return circles[id].lateBonus;
    }

    function getCircle(uint256 id)
        external
        view
        returns (
            address[] memory members,
            uint256 contribution,
            uint256 collateral,
            uint256 round,
            uint256 lastAction,
            uint8 mode,
            bool finished,
            uint256 lateBonus
        )
    {
        Circle storage c = circles[id];
        return (
            c.members,
            c.contribution,
            c.collateral,
            c.round,
            c.lastAction,
            uint8(c.mode),
            c.finished,
            c.lateBonus
        );
    }

    function _isMember(Circle storage c, address u) private view returns (bool) {
        for (uint256 i; i < c.members.length; i++) if (c.members[i] == u) return true;
        return false;
    }
}
