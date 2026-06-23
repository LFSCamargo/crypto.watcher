// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Test } from "forge-std/Test.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";
import { ReputationRegistry } from "../../src/reputation/ReputationRegistry.sol";
import { ProjectReview } from "../../src/review/ProjectReview.sol";

contract ProjectReviewTest is Test {
    ReputationRegistry internal reputation;
    ProtocolSettings internal settings;
    ProjectReview internal review;

    bytes32 internal projectId = keccak256("project:uniswap");
    address internal team = makeAddr("team");
    address internal submitter = makeAddr("submitter");
    address internal governor = makeAddr("governor");
    address internal outsider = makeAddr("outsider");

    bytes32 internal reportHash = keccak256("ipfs://report-1");

    function setUp() public {
        reputation = new ReputationRegistry(team, 1);
        settings = new ProtocolSettings(team, 1);
        review = new ProjectReview(projectId, submitter, team, reputation, settings);

        vm.prank(team);
        reputation.setEligibility(governor, true, 10);
    }

    function test_metadataIsStored() public view {
        assertEq(review.projectId(), projectId);
        assertEq(review.submitter(), submitter);
        assertEq(review.team(), team);
        assertEq(address(review.reputation()), address(reputation));
        assertEq(address(review.settings()), address(settings));
        assertEq(uint8(review.status()), uint8(ProjectReview.Status.Requested));
    }

    function test_lifecycleHappyPath() public {
        vm.prank(team);
        review.beginAnalysis();
        assertEq(uint8(review.status()), uint8(ProjectReview.Status.InAnalysis));

        vm.prank(governor);
        uint256 round = review.publishReport(72, reportHash);

        assertEq(round, 1);
        assertEq(uint8(review.status()), uint8(ProjectReview.Status.Published));
        assertEq(review.currentScore(), 72);
        assertEq(review.reportCount(), 1);

        ProjectReview.Report memory r = review.latestReport();
        assertEq(r.riskScore, 72);
        assertEq(r.reportHash, reportHash);
        assertEq(r.methodologyVersion, 1);
        assertEq(r.governor, governor);
    }

    function test_onlyTeamCanBeginAnalysis() public {
        vm.prank(governor);
        vm.expectRevert(ProjectReview.NotTeam.selector);
        review.beginAnalysis();
    }

    function test_cannotPublishBeforeAnalysis() public {
        vm.prank(governor);
        vm.expectRevert(ProjectReview.InvalidStatus.selector);
        review.publishReport(50, reportHash);
    }

    function test_nonGovernorCannotPublish() public {
        vm.prank(team);
        review.beginAnalysis();

        vm.prank(outsider);
        vm.expectRevert(ProjectReview.NotGovernor.selector);
        review.publishReport(50, reportHash);
    }

    function test_submitterCannotPublishOwnReview() public {
        vm.prank(team);
        review.beginAnalysis();

        // Even a submitter who is also a governor is blocked (conflict of interest).
        vm.prank(team);
        reputation.setEligibility(submitter, true, 10);

        vm.prank(submitter);
        vm.expectRevert(ProjectReview.ConflictOfInterest.selector);
        review.publishReport(50, reportHash);
    }

    function test_scoreAboveMaxReverts() public {
        vm.prank(team);
        review.beginAnalysis();

        vm.prank(governor);
        vm.expectRevert(ProjectReview.InvalidScore.selector);
        review.publishReport(101, reportHash);
    }

    function test_zeroReportHashReverts() public {
        vm.prank(team);
        review.beginAnalysis();

        vm.prank(governor);
        vm.expectRevert(ProjectReview.InvalidReportHash.selector);
        review.publishReport(50, bytes32(0));
    }

    function test_reReviewAppendsImmutableRounds() public {
        vm.prank(team);
        review.beginAnalysis();

        vm.prank(governor);
        review.publishReport(40, reportHash);

        // Governance bumps methodology, then a re-review is published.
        vm.prank(team);
        settings.setMethodologyVersion(2);

        bytes32 reportHash2 = keccak256("ipfs://report-2");
        vm.prank(governor);
        uint256 round = review.publishReport(65, reportHash2);

        assertEq(round, 2);
        assertEq(review.reportCount(), 2);
        assertEq(review.currentScore(), 65);

        // First round stays immutable.
        ProjectReview.Report memory first = review.reportAt(0);
        assertEq(first.riskScore, 40);
        assertEq(first.methodologyVersion, 1);

        ProjectReview.Report memory second = review.reportAt(1);
        assertEq(second.riskScore, 65);
        assertEq(second.methodologyVersion, 2);
    }

    function test_viewsRevertWithoutReport() public {
        vm.expectRevert(ProjectReview.NoReport.selector);
        review.currentScore();

        vm.expectRevert(ProjectReview.NoReport.selector);
        review.latestReport();

        vm.expectRevert(ProjectReview.NoReport.selector);
        review.reportAt(0);
    }
}
