// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Governance-controlled protocol parameters consumed on-chain. [MVP]
/// @dev Source of truth for the review methodology version that every published
///      report is stamped with (see `ProjectReview.publishReport`).
interface IProtocolSettings {
    /// @return The current review methodology version (monotonic, governance-set).
    function methodologyVersion() external view returns (uint32);
}
