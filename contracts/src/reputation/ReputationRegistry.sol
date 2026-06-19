// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Roles } from "../access/Roles.sol";
import { IReputationRegistry } from "./interfaces/IReputationRegistry.sol";

/// @title ReputationRegistry
/// @notice Allow-list + basic weight for reputation-gated voting. [MVP]
/// @dev Multi-factor scoring/decay is added in [Phase 1] (docs/CONTRACTS.mdc).
contract ReputationRegistry is AccessControl, IReputationRegistry {
    mapping(address => bool) private _eligible;
    mapping(address => uint256) private _weight;
    uint256 public minimumWeight;

    event EligibilitySet(address indexed account, bool eligible, uint256 weight);
    event MinimumWeightSet(uint256 minimumWeight);

    constructor(address admin, uint256 minimumWeight_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REPUTATION_MANAGER_ROLE, admin);
        minimumWeight = minimumWeight_;
    }

    function setEligibility(address account, bool eligible, uint256 weight)
        external
        onlyRole(Roles.REPUTATION_MANAGER_ROLE)
    {
        _eligible[account] = eligible;
        _weight[account] = eligible ? weight : 0;
        emit EligibilitySet(account, eligible, _weight[account]);
    }

    function isEligible(address account) external view returns (bool) {
        return _eligible[account] && _weight[account] >= minimumWeight;
    }

    function weightOf(address account) external view returns (uint256) {
        return _weight[account];
    }

    function setMinimumWeight(uint256 minimumWeight_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minimumWeight = minimumWeight_;
        emit MinimumWeightSet(minimumWeight_);
    }
}
