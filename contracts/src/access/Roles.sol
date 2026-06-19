// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @dev Shared role identifiers used across modules. See docs/CONTRACTS.mdc.
library Roles {
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");
    bytes32 public constant VOTING_FACTORY_ROLE = keccak256("VOTING_FACTORY_ROLE");
}
