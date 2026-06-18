// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {ReputationRegistry} from "../../src/reputation/ReputationRegistry.sol";
import {ProjectVoting} from "../../src/voting/ProjectVoting.sol";

contract ProjectVotingTest is Test {
    ReputationRegistry internal reputation;
    ProjectVoting internal voting;

    address internal team = makeAddr("team");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        reputation = new ReputationRegistry(team);
        voting = new ProjectVoting(team, reputation);

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
}
