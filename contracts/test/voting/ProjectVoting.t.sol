// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "forge-std/Test.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";
import { ProjectVoting } from "../../src/voting/ProjectVoting.sol";

contract ProjectVotingTest is Test {
    ReputationRegistry internal reputation;
    ProjectVoting internal voting;

    bytes32 internal projectId = keccak256("project:uniswap");
    address internal team = makeAddr("team");
    address internal submitter = makeAddr("submitter");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        reputation = new ReputationRegistry(team, 1);
        voting = new ProjectVoting(projectId, submitter, team, reputation, 3 days);

        vm.startPrank(team);
        reputation.setEligibility(alice, true, 10);
        voting.openVoting();
        vm.stopPrank();
    }

    function test_eligibleVoteCounts() public {
        vm.prank(alice);
        voting.castVote(ProjectVoting.Choice.For);
        assertEq(voting.weightFor(), 10);
    }

    function test_projectMetadataIsStored() public view {
        assertEq(voting.projectId(), projectId);
        assertEq(voting.submitter(), submitter);
        assertEq(voting.team(), team);
        assertEq(voting.votingDuration(), 3 days);
    }

    function test_ineligibleReverts() public {
        vm.prank(bob);
        vm.expectRevert(ProjectVoting.NotEligible.selector);
        voting.castVote(ProjectVoting.Choice.For);
    }

    function test_doubleVoteReverts() public {
        vm.startPrank(alice);
        voting.castVote(ProjectVoting.Choice.For);
        vm.expectRevert(ProjectVoting.AlreadyVoted.selector);
        voting.castVote(ProjectVoting.Choice.Against);
        vm.stopPrank();
    }

    function test_onlyTeamCloses() public {
        vm.prank(alice);
        vm.expectRevert(ProjectVoting.NotTeam.selector);
        voting.closeVoting();
    }

    function test_cannotVoteAfterDuration() public {
        vm.warp(block.timestamp + 4 days);
        vm.prank(alice);
        vm.expectRevert(ProjectVoting.InvalidState.selector);
        voting.castVote(ProjectVoting.Choice.For);
    }
}
