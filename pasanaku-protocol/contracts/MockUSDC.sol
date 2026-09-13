// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Stablecoin de PRUEBA para HSK testnet. Cualquiera puede mintear.
///         NO usar en mainnet. Sirve para demostrar el pozo con dinero de prueba en Fuji.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
