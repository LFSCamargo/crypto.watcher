// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IProtocolSettings } from "./interfaces/IProtocolSettings.sol";

/// @title ProtocolSettings
/// @notice Governance-controlled protocol parameters for the review process. [MVP]
/// @dev Owned by the Timelock. The `methodologyVersion` is read by every
///      `ProjectReview` when a governor publishes a report, so changing it via
///      governance directly affects on-chain behavior (no orphaned settings).
contract ProtocolSettings is Ownable, IProtocolSettings {
    /// @inheritdoc IProtocolSettings
    uint32 public methodologyVersion;

    event MethodologyVersionSet(uint32 previousVersion, uint32 newVersion);

    error InvalidMethodologyVersion();

    constructor(address owner_, uint32 methodologyVersion_) Ownable(owner_) {
        _setMethodologyVersion(methodologyVersion_);
    }

    /// @notice Bump the active review methodology version (governance only).
    /// @dev Must be strictly increasing to keep an auditable, monotonic history.
    function setMethodologyVersion(uint32 methodologyVersion_) external onlyOwner {
        _setMethodologyVersion(methodologyVersion_);
    }

    function _setMethodologyVersion(uint32 methodologyVersion_) private {
        if (methodologyVersion_ <= methodologyVersion) revert InvalidMethodologyVersion();
        emit MethodologyVersionSet(methodologyVersion, methodologyVersion_);
        methodologyVersion = methodologyVersion_;
    }
}
