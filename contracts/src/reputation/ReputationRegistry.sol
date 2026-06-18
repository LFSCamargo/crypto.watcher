// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Roles} from "../access/Roles.sol";
import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";

/// @title ReputationRegistry
/// @notice Allow-list + basic weight for reputation-gated voting. [MVP]
/// @dev Multi-factor scoring/decay is added in [Phase 1] (docs/CONTRACTS.mdc).
contract ReputationRegistry is AccessControl, IReputationRegistry {
    mapping(address => bool) private _eligible;
    mapping(address => uint256) private _weight;

    event EligibilitySet(address indexed account, bool eligible, uint256 weight);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REPUTATION_MANAGER_ROLE, admin);
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
        return _eligible[account];
    }

    function weightOf(address account) external view returns (uint256) {
        return _weight[account];
    }
}
