// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Roles } from "../access/Roles.sol";
import { IReputationRegistry } from "./interfaces/IReputationRegistry.sol";

/// @title ReputationRegistry
/// @notice Council governor allow-list + accountability weight. [MVP]
/// @dev This gates *who may publish official project reports* (the vetted governor
///      council) — it is NOT public score-voting eligibility. Eligible governors
///      are also granted `GOVERNOR_ROLE` for off-chain/role introspection.
///      Multi-factor scoring/decay is added in [Phase 1] (docs/CONTRACTS.mdc).
contract ReputationRegistry is AccessControl, IReputationRegistry {
    mapping(address => uint256) private _weight;
    mapping(address => bool) private _eligible;
    uint256 public minimumWeight;

    event GovernorSet(address indexed account, bool eligible, uint256 weight);
    event MinimumWeightSet(uint256 previousMinimumWeight, uint256 newMinimumWeight);

    error ZeroAccount();

    constructor(address admin, uint256 minimumWeight_) {
        if (admin == address(0)) revert ZeroAccount();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REPUTATION_MANAGER_ROLE, admin);
        minimumWeight = minimumWeight_;
        emit MinimumWeightSet(0, minimumWeight_);
    }

    /// @notice Add, update or remove a council governor and their weight.
    function setEligibility(address account, bool eligible, uint256 weight)
        external
        onlyRole(Roles.REPUTATION_MANAGER_ROLE)
    {
        if (account == address(0)) revert ZeroAccount();
        _eligible[account] = eligible;
        _weight[account] = eligible ? weight : 0;

        if (eligible) _grantRole(Roles.GOVERNOR_ROLE, account);
        else _revokeRole(Roles.GOVERNOR_ROLE, account);

        emit GovernorSet(account, eligible, _weight[account]);
    }

    /// @inheritdoc IReputationRegistry
    function isEligible(address account) external view returns (bool) {
        return _eligible[account] && _weight[account] >= minimumWeight;
    }

    /// @inheritdoc IReputationRegistry
    function weightOf(address account) external view returns (uint256) {
        return _weight[account];
    }

    /// @notice Raise/lower the minimum accountability weight for eligibility.
    function setMinimumWeight(uint256 minimumWeight_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit MinimumWeightSet(minimumWeight, minimumWeight_);
        minimumWeight = minimumWeight_;
    }
}
