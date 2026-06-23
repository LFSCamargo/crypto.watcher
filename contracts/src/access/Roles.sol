// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @dev Shared role identifiers used across modules. See docs/CONTRACTS.mdc.
library Roles {
    /// @notice Vetted council member allowed to publish official project reports.
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    /// @notice Manages the council roster + accountability weights (governance).
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");
}
