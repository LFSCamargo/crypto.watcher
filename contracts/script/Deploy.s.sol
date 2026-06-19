// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { CryptoWatcherGovernor } from "../src/governance/CryptoWatcherGovernor.sol";
import { GovernanceToken } from "../src/governance/GovernanceToken.sol";
import { ProtocolSettings } from "../src/governance/ProtocolSettings.sol";
import { Timelock } from "../src/governance/Timelock.sol";
import { ReputationRegistry } from "../src/reputation/ReputationRegistry.sol";
import { ProjectWatcherFactory } from "../src/voting/ProjectWatcherFactory.sol";

/// @notice MVP deployment: governance (token + timelock + governor), reputation
///         registry, the backend-controlled project-voting factory and protocol
///         settings.
/// @dev Parameters are overridable via environment variables so the same script
///      works for local anvil and public testnets. Governance (the timelock)
///      owns the upgradeable/pausable surfaces after deployment.
contract Deploy is Script {
    function run() external {
        address admin = msg.sender;
        uint256 initialSupply = vm.envOr("INITIAL_SUPPLY", uint256(100_000_000 ether));
        uint64 votingDuration = uint64(vm.envOr("VOTING_DURATION", uint256(3 days)));
        uint256 timelockDelay = vm.envOr("TIMELOCK_MIN_DELAY", uint256(1 days));
        uint256 minReputationWeight = vm.envOr("MIN_REPUTATION_WEIGHT", uint256(1));
        // Platform backend that is allowed to emit project contracts. Defaults to
        // the deployer for local runs; set BACKEND_SUBMITTER on real networks.
        address backend = vm.envOr("BACKEND_SUBMITTER", admin);

        vm.startBroadcast();

        // Governance: token + timelock + governor.
        GovernanceToken token = new GovernanceToken(admin, initialSupply);

        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        Timelock timelock = new Timelock(timelockDelay, proposers, executors, admin);
        CryptoWatcherGovernor governor = new CryptoWatcherGovernor(token, timelock);

        // Wire the governor into the timelock and hand control to governance.
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), admin);

        // Reputation + project voting factory + governance-tunable settings.
        // The timelock is both the operating team and the factory owner so that
        // lifecycle control and the pause switch are governance-controlled.
        ReputationRegistry reputation =
            new ReputationRegistry(address(timelock), minReputationWeight);
        ProjectWatcherFactory factory = new ProjectWatcherFactory(
            address(timelock), reputation, votingDuration, address(timelock), backend
        );
        ProtocolSettings settings =
            new ProtocolSettings(address(timelock), votingDuration, minReputationWeight);

        vm.stopBroadcast();

        console2.log("GovernanceToken:      ", address(token));
        console2.log("Timelock:             ", address(timelock));
        console2.log("CryptoWatcherGovernor:", address(governor));
        console2.log("ReputationRegistry:   ", address(reputation));
        console2.log("ProjectWatcherFactory:", address(factory));
        console2.log("Factory backend:      ", backend);
        console2.log("ProtocolSettings:     ", address(settings));
    }
}
