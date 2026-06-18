// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Eligibility + voting-weight source. [MVP] (docs/CONTRACTS.mdc)
interface IReputationRegistry {
    function isEligible(address account) external view returns (bool);
    function weightOf(address account) external view returns (uint256);
}
