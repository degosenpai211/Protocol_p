// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Lock falso para tests y para Fuji (Unlock oficial no está en 43113).
///         Misma interfaz que PublicLock.getHasValidKey.
contract UnlockMock {
    mapping(address => bool) public valid;

    function setHasValidKey(address user, bool ok) external {
        valid[user] = ok;
    }

    function grantKeys(address[] calldata users) external {
        for (uint256 i; i < users.length; i++) {
            valid[users[i]] = true;
        }
    }

    function getHasValidKey(address user) external view returns (bool) {
        return valid[user];
    }
}
