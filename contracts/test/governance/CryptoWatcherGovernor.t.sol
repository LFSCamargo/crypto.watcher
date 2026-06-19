// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "forge-std/Test.sol";
import { CryptoWatcherGovernor } from "../../src/governance/CryptoWatcherGovernor.sol";
import { GovernanceToken } from "../../src/governance/GovernanceToken.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";
import { Timelock } from "../../src/governance/Timelock.sol";

contract CryptoWatcherGovernorTest is Test {
    GovernanceToken internal token;
    Timelock internal timelock;
    CryptoWatcherGovernor internal governor;
    ProtocolSettings internal settings;

    address internal admin = makeAddr("admin");

    function setUp() public {
        token = new GovernanceToken(admin, 1_000_000 ether);

        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        timelock = new Timelock(1, proposers, executors, admin);
        governor = new CryptoWatcherGovernor(token, timelock);

        vm.startPrank(admin);
        token.delegate(admin);
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), admin);
        vm.stopPrank();

        settings = new ProtocolSettings(address(timelock), 3 days, 1);
    }

    function test_tokenDelegationCreatesVotingUnits() public view {
        assertEq(token.getVotes(admin), 1_000_000 ether);
    }

    function test_governanceCanUpdateProtocolSettingsThroughTimelock() public {
        address[] memory targets = new address[](1);
        targets[0] = address(settings);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeCall(ProtocolSettings.setVotingDuration, (7 days));

        string memory description = "Set voting duration to seven days";
        bytes32 descriptionHash = keccak256(bytes(description));

        vm.prank(admin);
        uint256 proposalId = governor.propose(targets, values, calldatas, description);

        vm.roll(block.number + governor.votingDelay() + 1);

        vm.prank(admin);
        governor.castVote(proposalId, 1);

        vm.roll(block.number + governor.votingPeriod() + 1);

        governor.queue(targets, values, calldatas, descriptionHash);
        vm.warp(block.timestamp + timelock.getMinDelay() + 1);
        governor.execute(targets, values, calldatas, descriptionHash);

        assertEq(settings.votingDuration(), 7 days);
    }
}
