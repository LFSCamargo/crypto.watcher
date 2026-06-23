// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Council governor credential source. [MVP] (docs/CONTRACTS.mdc)
/// @dev `isEligible` gates which addresses may publish official project reports;
///      `weightOf` carries each governor's accountability weight (not a public
///      vote weight — the protocol does not use token/reputation vote-to-rate).
interface IReputationRegistry {
    /// @return True when `account` is a vetted council governor in good standing.
    function isEligible(address account) external view returns (bool);

    /// @return The governor's accountability weight (0 when not eligible).
    function weightOf(address account) external view returns (uint256);
}
