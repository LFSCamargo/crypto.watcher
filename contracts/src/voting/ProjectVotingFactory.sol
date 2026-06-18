// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IReputationRegistry} from "../reputation/interfaces/IReputationRegistry.sol";
import {ProjectVoting} from "./ProjectVoting.sol";

/// @title ProjectVotingFactory
/// @notice Deploys one ProjectVoting contract per project. [MVP] (docs/CONTRACTS.mdc)
contract ProjectVotingFactory {
    address public immutable team;
    IReputationRegistry public immutable reputation;

    event ProjectVotingDeployed(bytes32 indexed projectId, address voting);

    constructor(address team_, IReputationRegistry reputation_) {
        team = team_;
        reputation = reputation_;
    }

    function deploy(bytes32 projectId) external returns (address) {
        ProjectVoting voting = new ProjectVoting(team, reputation);
        emit ProjectVotingDeployed(projectId, address(voting));
        return address(voting);
    }
}
