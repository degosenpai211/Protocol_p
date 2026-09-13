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
///         - El dinero solo se mueve por reglas. El pozo de la ronda es lo efectivamente aportado.
///         - Colateral chico y reembolsable + fondo de seguro + reputación.
///         - Dos modos: SAVINGS (todos aportan cada ronda) y CREDIT (el del turno no aporta).
///         MVP de hackathon, no auditado. Roadmap: auditoría + subasta / shuffle de turnos (ROSCASH).
contract PasanakuProtocol is ReentrancyGuard {
    IERC20 public immutable token;
    address public feeRecipient;
    IPublicLock public immutable membershipLock;

    uint256 public constant FEE_BPS = 100;
    uint256 public constant INSURANCE_BPS = 30;
    uint256 public constant LAST_BONUS_BPS = 600;
    uint256 public constant RECOVER_TIMEOUT = 7 days;
    uint256 public constant MIN_STALE = 3 days;
    uint256 public constant MAX_STALE = 7 days;

    uint256 public insuranceFund;

    enum Mode {
        SAVINGS,
        CREDIT
    }

    /// @notice 0 pending · 1 stale · 2 vivo · 3 cerrado
    enum Phase {
        Pending,
        Stale,
        Live,
        Closed
    }

    struct Circle {
        address[] members;
        uint256 contribution;
        uint256 collateral;
        uint256 round;
        uint256 lastAction;
        uint256 lateBonus;
        uint256 createdAt;
        uint256 staleTime;
        uint256 collected;
        Mode mode;
        bool finished;
        mapping(uint256 => mapping(address => bool)) paid;
        mapping(address => bool) joined;
        mapping(address => bool) hasCollateral;
    }

    uint256 public circleCount;
    mapping(uint256 => Circle) private circles;
    mapping(address => uint256) public withdrawable;
    mapping(address => uint256) public score;

    event CircleCreated(uint256 indexed id, uint8 mode, uint256 contribution, uint256 collateral);
    event Joined(uint256 indexed id, address indexed member);
    event Left(uint256 indexed id, address indexed member, uint256 amount);
    event Contributed(uint256 indexed id, uint256 round, address indexed member, address indexed payer);
    event Claimed(uint256 indexed id, uint256 round, address indexed recipient, uint256 net);
    event LateBonusAccrued(uint256 indexed id, uint256 amount, uint256 total);
    event Defaulted(uint256 indexed id, uint256 round, address indexed member, uint256 recovered);
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
        c.createdAt = block.timestamp;
        c.staleTime = MAX_STALE;
        emit CircleCreated(id, uint8(_mode), _contribution, _collateral);
    }

    function join(uint256 id) external nonReentrant {
        require(membershipLock.getHasValidKey(msg.sender), "no membership");
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(_isMember(c, msg.sender), "not listed");
        require(!c.joined[msg.sender], "already joined");
        require(!_isStale(c), "stale");
        c.joined[msg.sender] = true;
        c.hasCollateral[msg.sender] = true;
        c.lastAction = block.timestamp;
        if (c.collateral > 0) {
            require(token.transferFrom(msg.sender, address(this), c.collateral), "collateral fail");
        }
        emit Joined(id, msg.sender);
    }

    /// @notice Salís si el círculo no arrancó (faltan joins). Devuelve el colateral.
    function leave(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(c.joined[msg.sender], "not joined");
        require(!_started(c), "already started");
        c.joined[msg.sender] = false;
        uint256 amount = 0;
        if (c.hasCollateral[msg.sender]) {
            c.hasCollateral[msg.sender] = false;
            amount = c.collateral;
            if (amount > 0) withdrawable[msg.sender] += amount;
        }
        c.lastAction = block.timestamp;
        emit Left(id, msg.sender, amount);
    }

    function recipient(uint256 id) public view returns (address) {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        return c.members[c.round];
    }

    function contribute(uint256 id) external nonReentrant {
        _contribute(id, msg.sender);
    }

    /// @notice Un tercero (hermano, gremio) paga la cuota de `member`.
    function contributeFor(uint256 id, address member) external nonReentrant {
        _contribute(id, member);
    }

    function _contribute(uint256 id, address member) private {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(_started(c), "not started");
        require(c.joined[member], "join first");
        require(!c.paid[c.round][member], "already paid");
        if (c.mode == Mode.CREDIT) {
            require(member != c.members[c.round], "recipient does not pay");
        }
        c.paid[c.round][member] = true;
        c.collected += c.contribution;
        c.lastAction = block.timestamp;
        require(token.transferFrom(msg.sender, address(this), c.contribution), "pay fail");
        emit Contributed(id, c.round, member, msg.sender);
    }

    function _allPaid(Circle storage c) private view returns (bool) {
        address r = c.members[c.round];
        for (uint256 i; i < c.members.length; i++) {
            address m = c.members[i];
            if (c.mode == Mode.CREDIT && m == r) continue;
            if (!c.paid[c.round][m]) return false;
        }
        return true;
    }

    function allPaid(uint256 id) external view returns (bool) {
        return _allPaid(circles[id]);
    }

    /// @notice Cobra el pozo efectivamente aportado (no el teórico). Defaults ya acreditados aparte.
    function claim(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(msg.sender == c.members[c.round], "not your turn");
        require(_allPaid(c), "missing contributions");

        uint256 n = c.members.length;
        uint256 pot = c.collected;
        uint256 fee = (pot * FEE_BPS) / 10000;
        uint256 insurance = (pot * INSURANCE_BPS) / 10000;
        bool isLast = c.round + 1 == n;

        uint256 skim = 0;
        if (!isLast && n > 1 && pot > 0) {
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
        c.collected = 0;
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

    /// @notice Cubre lo que haya (colateral + seguro) y marca pagado para que el círculo siga.
    function markDefault(uint256 id, address defaulter) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(_started(c), "not started");
        require(c.mode == Mode.CREDIT, "no default in savings");
        require(c.joined[defaulter], "not member");
        require(defaulter != c.members[c.round], "recipient not payer");
        require(!c.paid[c.round][defaulter], "did pay");

        address r = c.members[c.round];
        uint256 owed = c.contribution;
        uint256 recovered = 0;

        if (c.hasCollateral[defaulter]) {
            c.hasCollateral[defaulter] = false;
            uint256 fromCollateral = owed <= c.collateral ? owed : c.collateral;
            if (fromCollateral > 0) {
                withdrawable[r] += fromCollateral;
                recovered += fromCollateral;
            }
        }

        if (owed > recovered) {
            uint256 gap = owed - recovered;
            uint256 cover = gap <= insuranceFund ? gap : insuranceFund;
            if (cover > 0) {
                insuranceFund -= cover;
                withdrawable[r] += cover;
                recovered += cover;
            }
        }

        c.paid[c.round][defaulter] = true;
        if (score[defaulter] > 0) score[defaulter] -= 1;
        c.lastAction = block.timestamp;
        emit Defaulted(id, c.round, defaulter, recovered);
    }

    function recover(uint256 id) external nonReentrant {
        Circle storage c = circles[id];
        require(!c.finished, "finished");
        require(_started(c), "not started");
        require(block.timestamp > c.lastAction + RECOVER_TIMEOUT, "not stuck yet");
        require(c.hasCollateral[msg.sender], "nothing to recover");
        c.hasCollateral[msg.sender] = false;
        uint256 amount = c.collateral;
        if (amount > 0) withdrawable[msg.sender] += amount;
        emit Recovered(id, msg.sender, amount);
    }

    function withdraw() external nonReentrant {
        uint256 amt = withdrawable[msg.sender];
        require(amt > 0, "nothing");
        withdrawable[msg.sender] = 0;
        require(token.transfer(msg.sender, amt), "transfer fail");
    }

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

    function phase(uint256 id) public view returns (uint8) {
        Circle storage c = circles[id];
        if (c.createdAt == 0) return uint8(Phase.Pending);
        if (c.finished) return uint8(Phase.Closed);
        if (_started(c)) return uint8(Phase.Live);
        if (_isStale(c)) return uint8(Phase.Stale);
        return uint8(Phase.Pending);
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
            uint256 lateBonus,
            uint256 createdAt,
            uint256 staleTime,
            uint256 collected
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
            c.lateBonus,
            c.createdAt,
            c.staleTime,
            c.collected
        );
    }

    function _isMember(Circle storage c, address u) private view returns (bool) {
        for (uint256 i; i < c.members.length; i++) if (c.members[i] == u) return true;
        return false;
    }

    function _started(Circle storage c) private view returns (bool) {
        if (c.members.length == 0) return false;
        for (uint256 i; i < c.members.length; i++) {
            if (!c.joined[c.members[i]]) return false;
        }
        return true;
    }

    function _isStale(Circle storage c) private view returns (bool) {
        return !_started(c) && block.timestamp > c.createdAt + c.staleTime;
    }
}
