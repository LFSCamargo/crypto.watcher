// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IReputationRegistry } from "../reputation/interfaces/IReputationRegistry.sol";
import { ProjectVoting } from "./ProjectVoting.sol";

/// @title ProjectWatcherFactory
/// @notice Backend-controlled factory: only the platform backend may emit
///         (deploy) a project's voting contract. Users request analysis and pay
///         for their review off-chain; once payment is settled the backend
///         submits the project on the user's behalf, recording that user as the
///         on-chain submitter. [MVP] (docs/CONTRACTS.mdc)
/// @dev Lifecycle: `submitProject` deploys a `ProjectVoting` in the `Ready`
///      state; the team then drives analysis -> open -> close. The backend
///      address is rotatable by governance (the owner); submissions are
///      `Pausable` as an emergency switch.
contract ProjectWatcherFactory is Ownable2Step, Pausable {
    /// @notice Team/operator that controls each deployed voting contract's lifecycle.
    address public immutable team;
    /// @notice Reputation source shared by every deployed voting contract.
    IReputationRegistry public immutable reputation;
    /// @notice Voting window applied to every deployed voting contract.
    uint64 public immutable votingDuration;

    /// @notice The only account allowed to submit/emit projects (the platform backend).
    address public backend;

    /// @notice Deployed voting contract per project id (zero when unregistered).
    mapping(bytes32 => address) public votingOf;
    /// @notice Account (paying user) the project was submitted on behalf of.
    mapping(bytes32 => address) public submitterOf;

    bytes32[] private _projectIds;

    event BackendUpdated(address indexed previousBackend, address indexed newBackend);
    event ProjectSubmitted(
        bytes32 indexed projectId, address indexed voting, address indexed submitter
    );

    error InvalidProjectId();
    error InvalidSubmitter();
    error ProjectAlreadyRegistered(bytes32 projectId);
    error NotBackend(address caller);

    modifier onlyBackend() {
        if (msg.sender != backend) revert NotBackend(msg.sender);
        _;
    }

    constructor(
        address team_,
        IReputationRegistry reputation_,
        uint64 votingDuration_,
        address owner_,
        address backend_
    ) Ownable(owner_) {
        require(team_ != address(0), "team is zero");
        require(address(reputation_) != address(0), "reputation is zero");
        require(votingDuration_ > 0, "duration is zero");
        require(backend_ != address(0), "backend is zero");
        team = team_;
        reputation = reputation_;
        votingDuration = votingDuration_;
        backend = backend_;
        emit BackendUpdated(address(0), backend_);
    }

    /// @notice Submit a project to be analyzed, deploying its voting contract.
    /// @dev Restricted to the backend; called after the user's review payment is
    ///      settled off-chain. The backend passes the paying user as `submitter`.
    /// @param projectId Unique identifier for the project (e.g. keccak of slug).
    /// @param submitter The user the project is submitted on behalf of.
    /// @return voting Address of the newly deployed `ProjectVoting` contract.
    function submitProject(bytes32 projectId, address submitter)
        external
        onlyBackend
        whenNotPaused
        returns (address voting)
    {
        if (projectId == bytes32(0)) revert InvalidProjectId();
        if (submitter == address(0)) revert InvalidSubmitter();
        if (votingOf[projectId] != address(0)) revert ProjectAlreadyRegistered(projectId);

        voting = address(new ProjectVoting(projectId, submitter, team, reputation, votingDuration));

        votingOf[projectId] = voting;
        submitterOf[projectId] = submitter;
        _projectIds.push(projectId);

        emit ProjectSubmitted(projectId, voting, submitter);
    }

    /// @notice Rotate the backend address (governance-controlled).
    function setBackend(address newBackend) external onlyOwner {
        require(newBackend != address(0), "backend is zero");
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

    /// @notice Whether a project id already has a deployed voting contract.
    function isRegistered(bytes32 projectId) external view returns (bool) {
        return votingOf[projectId] != address(0);
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
