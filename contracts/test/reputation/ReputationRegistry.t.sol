// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Test } from "forge-std/Test.sol";
import { Roles } from "../../src/access/Roles.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry internal reputation;

    address internal admin = makeAddr("admin");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        reputation = new ReputationRegistry(admin, 5);
    }

    function test_eligibleWalletMustMeetMinimumWeight() public {
        vm.startPrank(admin);
        reputation.setEligibility(alice, true, 10);
        reputation.setEligibility(bob, true, 3);
        vm.stopPrank();

        assertTrue(reputation.isEligible(alice));
        assertFalse(reputation.isEligible(bob));
        assertEq(reputation.weightOf(alice), 10);
    }

    function test_ineligibleWalletHasZeroWeight() public {
        vm.prank(admin);
        reputation.setEligibility(alice, false, 10);

        assertFalse(reputation.isEligible(alice));
        assertEq(reputation.weightOf(alice), 0);
    }

    function test_unauthorizedMutationReverts() public {
        vm.prank(alice);
        vm.expectRevert();
        reputation.setEligibility(alice, true, 10);
    }

    function test_adminCanUpdateMinimumWeight() public {
        vm.prank(admin);
        reputation.setMinimumWeight(20);

        assertEq(reputation.minimumWeight(), 20);
    }

    function test_roleConstantIsAvailable() public pure {
        assertEq(Roles.REPUTATION_MANAGER_ROLE, keccak256("REPUTATION_MANAGER_ROLE"));
        assertEq(Roles.GOVERNOR_ROLE, keccak256("GOVERNOR_ROLE"));
    }

    function test_eligibilityGrantsAndRevokesGovernorRole() public {
        vm.startPrank(admin);
        reputation.setEligibility(alice, true, 10);
        assertTrue(reputation.hasRole(Roles.GOVERNOR_ROLE, alice));

        reputation.setEligibility(alice, false, 0);
        assertFalse(reputation.hasRole(Roles.GOVERNOR_ROLE, alice));
        vm.stopPrank();
    }

    function test_zeroAccountReverts() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.ZeroAccount.selector);
        reputation.setEligibility(address(0), true, 10);
    }
}
