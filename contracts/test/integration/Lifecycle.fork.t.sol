// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { CryptoWatcherGovernor } from "../../src/governance/CryptoWatcherGovernor.sol";
import { GovernanceToken } from "../../src/governance/GovernanceToken.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";
import { Timelock } from "../../src/governance/Timelock.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";
import { ProjectVoting } from "../../src/voting/ProjectVoting.sol";
import { ProjectWatcherFactory } from "../../src/voting/ProjectWatcherFactory.sol";
import { ForkTest } from "./ForkTest.sol";

/// @title LifecycleForkTest
/// @notice End-to-end integration over a Sepolia fork: deploys the full MVP
///         stack and drives the project-voting and governance flows against
///         real testnet chain state. [MVP] (docs/CONTRACTS.mdc)
/// @dev Run with `SEPOLIA_RPC_URL=<url> forge test --match-path 'test/integration/*'`.
contract LifecycleForkTest is ForkTest {
    uint64 internal constant VOTING_DURATION = 3 days;
    uint256 internal constant INITIAL_SUPPLY = 1_000_000 ether;

    GovernanceToken internal token;
    Timelock internal timelock;
    CryptoWatcherGovernor internal governor;
    ReputationRegistry internal reputation;
    ProjectWatcherFactory internal factory;
    ProtocolSettings internal settings;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        _selectFork("SEPOLIA_RPC_URL");
        if (!forkActive) return;

        token = new GovernanceToken(address(this), INITIAL_SUPPLY);

        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        timelock = new Timelock(1, proposers, executors, address(this));
        governor = new CryptoWatcherGovernor(token, timelock);

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));

        // ProtocolSettings is governance-owned (via the timelock).
        settings = new ProtocolSettings(address(timelock), VOTING_DURATION, 1);

        // Reputation + factory are admininstered by this test for the voting flow.
        // This test contract acts as both governance owner and backend submitter.
        reputation = new ReputationRegistry(address(this), 1);
        factory = new ProjectWatcherFactory(
            address(this), reputation, VOTING_DURATION, address(this), address(this)
        );

        token.delegate(address(this));
    }

    /// @notice Sanity check that we are actually running on the Sepolia chain.
    function test_runsOnSepoliaFork() public onlyFork {
        assertEq(block.chainid, 11_155_111, "expected Sepolia chain id");
    }

    /// @notice Full reputation-weighted voting lifecycle on the fork.
    function test_projectVotingLifecycle() public onlyFork {
        bytes32 projectId = keccak256("project:aave");
        address payingUser = makeAddr("payingUser");
        ProjectVoting voting = ProjectVoting(factory.submitProject(projectId, payingUser));
        assertEq(voting.submitter(), payingUser);
        assertEq(factory.votingOf(projectId), address(voting));
        assertEq(factory.submitterOf(projectId), payingUser);

        reputation.setEligibility(alice, true, 10);
        reputation.setEligibility(bob, true, 5);

        voting.openVoting();

        vm.prank(alice);
        voting.castVote(ProjectVoting.Choice.For);
        vm.prank(bob);
        voting.castVote(ProjectVoting.Choice.Against);

        voting.closeVoting();

        assertEq(voting.weightFor(), 10);
        assertEq(voting.weightAgainst(), 5);
        assertEq(uint8(voting.state()), uint8(ProjectVoting.State.Closed));
    }

    /// @notice Governance proposal updates ProtocolSettings through the timelock.
    function test_governanceUpdatesProtocolSettings() public onlyFork {
        address[] memory targets = new address[](1);
        targets[0] = address(settings);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeCall(ProtocolSettings.setVotingDuration, (7 days));

        string memory description = "Set voting duration to seven days";
        bytes32 descriptionHash = keccak256(bytes(description));

        uint256 proposalId = governor.propose(targets, values, calldatas, description);

        vm.roll(block.number + governor.votingDelay() + 1);
        governor.castVote(proposalId, 1);

        vm.roll(block.number + governor.votingPeriod() + 1);
        governor.queue(targets, values, calldatas, descriptionHash);

        vm.warp(block.timestamp + timelock.getMinDelay() + 1);
        governor.execute(targets, values, calldatas, descriptionHash);

        assertEq(settings.votingDuration(), 7 days);
    }
}
