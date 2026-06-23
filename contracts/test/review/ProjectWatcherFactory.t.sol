// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { Test } from "forge-std/Test.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";
import { ProjectReview } from "../../src/review/ProjectReview.sol";
import { ProjectWatcherFactory } from "../../src/review/ProjectWatcherFactory.sol";

contract ProjectWatcherFactoryTest is Test {
    address internal team = makeAddr("team");
    address internal owner = makeAddr("owner");
    address internal backend = makeAddr("backend");
    address internal user = makeAddr("user");

    ReputationRegistry internal reputation;
    ProtocolSettings internal settings;
    ProjectWatcherFactory internal factory;

    bytes32 internal projectId = keccak256("project:aave");

    function setUp() public {
        reputation = new ReputationRegistry(team, 1);
        settings = new ProtocolSettings(team, 1);
        factory = new ProjectWatcherFactory(team, reputation, settings, owner, backend);
    }

    function test_backendSubmitsOnBehalfOfPayingUser() public {
        vm.prank(backend);
        address reviewAddress = factory.submitProject(projectId, user);
        ProjectReview review = ProjectReview(reviewAddress);

        assertEq(review.projectId(), projectId);
        assertEq(review.submitter(), user);
        assertEq(review.team(), team);
        assertEq(address(review.reputation()), address(reputation));
        assertEq(address(review.settings()), address(settings));
        assertEq(uint8(review.status()), uint8(ProjectReview.Status.Requested));

        assertEq(factory.reviewOf(projectId), reviewAddress);
        assertEq(factory.submitterOf(projectId), user);
        assertTrue(factory.isRegistered(projectId));
        assertEq(factory.projectCount(), 1);
        assertEq(factory.projectIdAt(0), projectId);
    }

    function test_nonBackendCannotSubmit() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(ProjectWatcherFactory.NotBackend.selector, user));
        factory.submitProject(projectId, user);
    }

    function test_ownerCannotSubmitUnlessBackend() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ProjectWatcherFactory.NotBackend.selector, owner));
        factory.submitProject(projectId, user);
    }

    function test_zeroSubmitterReverts() public {
        vm.prank(backend);
        vm.expectRevert(ProjectWatcherFactory.InvalidSubmitter.selector);
        factory.submitProject(projectId, address(0));
    }

    function test_zeroProjectIdReverts() public {
        vm.prank(backend);
        vm.expectRevert(ProjectWatcherFactory.InvalidProjectId.selector);
        factory.submitProject(bytes32(0), user);
    }

    function test_duplicateProjectReverts() public {
        vm.startPrank(backend);
        factory.submitProject(projectId, user);
        vm.expectRevert(
            abi.encodeWithSelector(
                ProjectWatcherFactory.ProjectAlreadyRegistered.selector, projectId
            )
        );
        factory.submitProject(projectId, user);
        vm.stopPrank();
    }

    function test_governanceCanRotateBackend() public {
        address newBackend = makeAddr("newBackend");
        vm.prank(owner);
        factory.setBackend(newBackend);
        assertEq(factory.backend(), newBackend);

        vm.prank(newBackend);
        address reviewAddress = factory.submitProject(projectId, user);
        assertTrue(reviewAddress != address(0));
    }

    function test_onlyOwnerCanRotateBackend() public {
        vm.prank(backend);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, backend)
        );
        factory.setBackend(makeAddr("newBackend"));
    }

    function test_setZeroBackendReverts() public {
        vm.prank(owner);
        vm.expectRevert(ProjectWatcherFactory.ZeroAddress.selector);
        factory.setBackend(address(0));
    }

    function test_pauseBlocksSubmission() public {
        vm.prank(owner);
        factory.pause();

        vm.prank(backend);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        factory.submitProject(projectId, user);
    }

    function test_unpauseRestoresSubmission() public {
        vm.startPrank(owner);
        factory.pause();
        factory.unpause();
        vm.stopPrank();

        vm.prank(backend);
        address reviewAddress = factory.submitProject(projectId, user);
        assertTrue(reviewAddress != address(0));
    }

    function test_onlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user));
        factory.pause();
    }
}
