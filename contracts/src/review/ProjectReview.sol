// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Time } from "@openzeppelin/contracts/utils/types/Time.sol";
import { IReputationRegistry } from "../reputation/interfaces/IReputationRegistry.sol";
import { IProtocolSettings } from "../governance/interfaces/IProtocolSettings.sol";

/// @title ProjectReview
/// @notice Per-project on-chain review record. Official risk reports are published
///         only by vetted council governors — there is no public, token- or
///         reputation-weighted vote-to-rate. [MVP] (docs/CONTRACTS.mdc)
/// @dev Lifecycle mirrors the product flow:
///      `Requested -> InAnalysis -> Published` (re-reviews append new rounds).
///      Each published `Report` is immutable; the array is the audit trail.
contract ProjectReview {
    enum Status {
        Requested,
        InAnalysis,
        Published
    }

    /// @param riskScore Risk score 0 (lowest risk) .. 100 (highest risk).
    /// @param reportHash Content hash (e.g. IPFS CID digest) of the full report.
    /// @param methodologyVersion Methodology version snapshot at publish time.
    /// @param publishedAt Block timestamp the report was published.
    /// @param governor Council governor that published the report.
    struct Report {
        uint8 riskScore;
        bytes32 reportHash;
        uint32 methodologyVersion;
        uint64 publishedAt;
        address governor;
    }

    uint8 public constant MAX_RISK_SCORE = 100;

    /// @notice Lifecycle operator (the Timelock/team) that advances analysis.
    address public immutable team;
    /// @notice The paying user the project was submitted on behalf of.
    address public immutable submitter;
    /// @notice Council governor credential source.
    IReputationRegistry public immutable reputation;
    /// @notice Governance-controlled methodology version source.
    IProtocolSettings public immutable settings;
    /// @notice Unique project identifier (e.g. keccak of slug).
    bytes32 public immutable projectId;

    Status public status;
    Report[] private _reports;

    event AnalysisStarted(bytes32 indexed projectId, uint64 startedAt);
    event ReportPublished(
        bytes32 indexed projectId,
        address indexed governor,
        uint256 indexed round,
        uint8 riskScore,
        bytes32 reportHash,
        uint32 methodologyVersion
    );

    error NotTeam();
    error NotGovernor();
    error InvalidStatus();
    error InvalidScore();
    error InvalidReportHash();
    error ConflictOfInterest();
    error ZeroAddress();
    error NoReport();

    modifier onlyTeam() {
        if (msg.sender != team) revert NotTeam();
        _;
    }

    modifier onlyGovernor() {
        if (!reputation.isEligible(msg.sender)) revert NotGovernor();
        _;
    }

    constructor(
        bytes32 projectId_,
        address submitter_,
        address team_,
        IReputationRegistry reputation_,
        IProtocolSettings settings_
    ) {
        if (projectId_ == bytes32(0)) revert InvalidStatus();
        if (submitter_ == address(0) || team_ == address(0)) revert ZeroAddress();
        if (address(reputation_) == address(0) || address(settings_) == address(0)) {
            revert ZeroAddress();
        }
        projectId = projectId_;
        submitter = submitter_;
        team = team_;
        reputation = reputation_;
        settings = settings_;
        status = Status.Requested;
    }

    /// @notice Move the project into analysis (operator/team only).
    function beginAnalysis() external onlyTeam {
        if (status != Status.Requested) revert InvalidStatus();
        status = Status.InAnalysis;
        emit AnalysisStarted(projectId, _now());
    }

    /// @notice Publish an official report. Restricted to vetted council governors.
    /// @dev A governor cannot review a project they themselves submitted
    ///      (conflict of interest). Re-reviews append a new immutable round.
    /// @param riskScore Risk score in [0, MAX_RISK_SCORE].
    /// @param reportHash Non-zero content hash of the full off-chain report.
    /// @return round The 1-based index of the published report round.
    function publishReport(uint8 riskScore, bytes32 reportHash)
        external
        onlyGovernor
        returns (uint256 round)
    {
        if (status == Status.Requested) revert InvalidStatus();
        if (riskScore > MAX_RISK_SCORE) revert InvalidScore();
        if (reportHash == bytes32(0)) revert InvalidReportHash();
        if (msg.sender == submitter) revert ConflictOfInterest();

        uint32 methodologyVersion = settings.methodologyVersion();
        _reports.push(
            Report({
                riskScore: riskScore,
                reportHash: reportHash,
                methodologyVersion: methodologyVersion,
                publishedAt: _now(),
                governor: msg.sender
            })
        );
        status = Status.Published;
        round = _reports.length;

        emit ReportPublished(
            projectId, msg.sender, round, riskScore, reportHash, methodologyVersion
        );
    }

    /// @notice Number of published report rounds (audit trail length).
    function reportCount() external view returns (uint256) {
        return _reports.length;
    }

    /// @notice Report at a given round index (0-based).
    function reportAt(uint256 index) external view returns (Report memory) {
        if (index >= _reports.length) revert NoReport();
        return _reports[index];
    }

    /// @notice The most recent (current official) report.
    function latestReport() external view returns (Report memory) {
        uint256 length = _reports.length;
        if (length == 0) revert NoReport();
        return _reports[length - 1];
    }

    /// @notice Current official risk score (reverts if no report published yet).
    function currentScore() external view returns (uint8) {
        uint256 length = _reports.length;
        if (length == 0) revert NoReport();
        return _reports[length - 1].riskScore;
    }

    function _now() private view returns (uint64) {
        return uint64(Time.timestamp());
    }
}
