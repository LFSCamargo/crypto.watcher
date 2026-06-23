// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { CryptoWatcherGovernor } from "../../src/governance/CryptoWatcherGovernor.sol";
import { GovernanceToken } from "../../src/governance/GovernanceToken.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";
import { Timelock } from "../../src/governance/Timelock.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";
import { ProjectReview } from "../../src/review/ProjectReview.sol";
import { ProjectWatcherFactory } from "../../src/review/ProjectWatcherFactory.sol";
import { ForkTest } from "./ForkTest.sol";

/// @title LifecycleForkTest
/// @notice End-to-end integration over a Sepolia fork: deploys the full MVP
///         stack and drives the project-review and governance flows against
///         real testnet chain state. [MVP] (docs/CONTRACTS.mdc)
/// @dev Run with `SEPOLIA_RPC_URL=<url> forge test --match-path 'test/integration/*'`.
contract LifecycleForkTest is ForkTest {
    uint256 internal constant INITIAL_SUPPLY = 1_000_000 ether;

    GovernanceToken internal token;
    Timelock internal timelock;
    CryptoWatcherGovernor internal governor;
    ReputationRegistry internal reputation;
    ProtocolSettings internal settings;
    ProjectWatcherFactory internal factory;

    address internal governorMember = makeAddr("governorMember");

    function setUp() public {
        _selectFork("SEPOLIA_RPC_URL");
        if (!forkActive) return;

        token = new GovernanceToken(address(this), INITIAL_SUPPLY);

        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        timelock = new Timelock(1, proposers, executors, address(this));
        governor = new CryptoWatcherGovernor(token, timelock, 1, 50_400, 0, 4);

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));

        // Council registry, settings and factory are administered by this test.
        // This test contract acts as governance owner / team / backend submitter.
        reputation = new ReputationRegistry(address(this), 1);
        settings = new ProtocolSettings(address(timelock), 1);
        factory = new ProjectWatcherFactory(
            address(this), reputation, settings, address(this), address(this)
        );

        token.delegate(address(this));
    }

    /// @notice Sanity check that we are actually running on the Sepolia chain.
    function test_runsOnSepoliaFork() public onlyFork {
        assertEq(block.chainid, 11_155_111, "expected Sepolia chain id");
    }

    /// @notice Full governor review lifecycle on the fork.
    function test_projectReviewLifecycle() public onlyFork {
        bytes32 projectId = keccak256("project:aave");
        address payingUser = makeAddr("payingUser");
        ProjectReview review = ProjectReview(factory.submitProject(projectId, payingUser));
        assertEq(review.submitter(), payingUser);
        assertEq(factory.reviewOf(projectId), address(review));
        assertEq(factory.submitterOf(projectId), payingUser);

        reputation.setEligibility(governorMember, true, 10);

        review.beginAnalysis();

        vm.prank(governorMember);
        review.publishReport(63, keccak256("ipfs://report"));

        assertEq(review.currentScore(), 63);
        assertEq(uint8(review.status()), uint8(ProjectReview.Status.Published));
    }

    /// @notice Governance proposal updates ProtocolSettings through the timelock.
    function test_governanceUpdatesProtocolSettings() public onlyFork {
        address[] memory targets = new address[](1);
        targets[0] = address(settings);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeCall(ProtocolSettings.setMethodologyVersion, (2));

        string memory description = "Bump methodology version to 2";
        bytes32 descriptionHash = keccak256(bytes(description));

        uint256 proposalId = governor.propose(targets, values, calldatas, description);

        vm.roll(block.number + governor.votingDelay() + 1);
        governor.castVote(proposalId, 1);

        vm.roll(block.number + governor.votingPeriod() + 1);
        governor.queue(targets, values, calldatas, descriptionHash);

        vm.warp(block.timestamp + timelock.getMinDelay() + 1);
        governor.execute(targets, values, calldatas, descriptionHash);

        assertEq(settings.methodologyVersion(), 2);
    }
}
