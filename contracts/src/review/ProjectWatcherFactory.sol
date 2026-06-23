// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IReputationRegistry } from "../reputation/interfaces/IReputationRegistry.sol";
import { IProtocolSettings } from "../governance/interfaces/IProtocolSettings.sol";
import { ProjectReview } from "./ProjectReview.sol";

/// @title ProjectWatcherFactory
/// @notice Backend-controlled factory: only the platform backend may emit
///         (deploy) a project's on-chain review record. Users request analysis
///         and pay for their review off-chain; once payment is settled the
///         backend submits the project on the user's behalf, recording that user
///         as the on-chain submitter. [MVP] (docs/CONTRACTS.mdc)
/// @dev `submitProject` deploys a `ProjectReview` in the `Requested` state; the
///      team then drives analysis and vetted governors publish official reports.
///      The backend address is rotatable by governance (the owner); submissions
///      are `Pausable` as an emergency switch.
contract ProjectWatcherFactory is Ownable2Step, Pausable {
    /// @notice Lifecycle operator for each deployed review (the Timelock/team).
    address public immutable team;
    /// @notice Council governor credential source shared by every review.
    IReputationRegistry public immutable reputation;
    /// @notice Governance-controlled protocol settings shared by every review.
    IProtocolSettings public immutable settings;

    /// @notice The only account allowed to submit/emit projects (the platform backend).
    address public backend;

    /// @notice Deployed review contract per project id (zero when unregistered).
    mapping(bytes32 => address) public reviewOf;
    /// @notice Account (paying user) the project was submitted on behalf of.
    mapping(bytes32 => address) public submitterOf;

    bytes32[] private _projectIds;

    event BackendUpdated(address indexed previousBackend, address indexed newBackend);
    event ProjectSubmitted(
        bytes32 indexed projectId, address indexed review, address indexed submitter
    );

    error InvalidProjectId();
    error InvalidSubmitter();
    error ProjectAlreadyRegistered(bytes32 projectId);
    error NotBackend(address caller);
    error ZeroAddress();

    modifier onlyBackend() {
        if (msg.sender != backend) revert NotBackend(msg.sender);
        _;
    }

    constructor(
        address team_,
        IReputationRegistry reputation_,
        IProtocolSettings settings_,
        address owner_,
        address backend_
    ) Ownable(owner_) {
        if (
            team_ == address(0) || address(reputation_) == address(0)
                || address(settings_) == address(0) || backend_ == address(0)
        ) revert ZeroAddress();
        team = team_;
        reputation = reputation_;
        settings = settings_;
        backend = backend_;
        emit BackendUpdated(address(0), backend_);
    }

    /// @notice Submit a project to be reviewed, deploying its review record.
    /// @dev Restricted to the backend; called after the user's review payment is
    ///      settled off-chain. The backend passes the paying user as `submitter`.
    /// @param projectId Unique identifier for the project (e.g. keccak of slug).
    /// @param submitter The user the project is submitted on behalf of.
    /// @return review Address of the newly deployed `ProjectReview` contract.
    function submitProject(bytes32 projectId, address submitter)
        external
        onlyBackend
        whenNotPaused
        returns (address review)
    {
        if (projectId == bytes32(0)) revert InvalidProjectId();
        if (submitter == address(0)) revert InvalidSubmitter();
        if (reviewOf[projectId] != address(0)) revert ProjectAlreadyRegistered(projectId);

        review = address(new ProjectReview(projectId, submitter, team, reputation, settings));

        reviewOf[projectId] = review;
        submitterOf[projectId] = submitter;
        _projectIds.push(projectId);

        emit ProjectSubmitted(projectId, review, submitter);
    }

    /// @notice Rotate the backend address (governance-controlled).
    function setBackend(address newBackend) external onlyOwner {
        if (newBackend == address(0)) revert ZeroAddress();
        emit BackendUpdated(backend, newBackend);
        backend = newBackend;
    }

    /// @notice Pause new submissions (governance emergency switch).
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume submissions.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Whether a project id already has a deployed review contract.
    function isRegistered(bytes32 projectId) external view returns (bool) {
        return reviewOf[projectId] != address(0);
    }

    /// @notice Total number of submitted projects.
    function projectCount() external view returns (uint256) {
        return _projectIds.length;
    }

    /// @notice Project id at an enumeration index.
    function projectIdAt(uint256 index) external view returns (bytes32) {
        return _projectIds[index];
    }
}
