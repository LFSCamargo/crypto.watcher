// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {GovernanceToken} from "../src/governance/GovernanceToken.sol";
import {ReputationRegistry} from "../src/reputation/ReputationRegistry.sol";
import {ProjectVotingFactory} from "../src/voting/ProjectVotingFactory.sol";

/// @notice MVP deployment: token + reputation registry + voting factory.
contract Deploy is Script {
    function run() external {
        address admin = msg.sender;
        uint256 initialSupply = 100_000_000 ether;

        vm.startBroadcast();
        new GovernanceToken(admin, initialSupply);
        ReputationRegistry reputation = new ReputationRegistry(admin);
        new ProjectVotingFactory(admin, reputation);
        vm.stopBroadcast();
    }
}
