// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Time } from "@openzeppelin/contracts/utils/types/Time.sol";
import { IReputationRegistry } from "../reputation/interfaces/IReputationRegistry.sol";

/// @title ProjectVoting
/// @notice Per-project, reputation-gated, reputation-weighted voting. [MVP]
/// @dev Lifecycle mirrors README/docs: Ready -> Voting -> Closed -> Analyzed.
contract ProjectVoting {
    enum State {
        Ready,
        Voting,
        Closed
    }

    enum Choice {
        Against,
        For
    }

    address public immutable team;
    address public immutable submitter;
    IReputationRegistry public immutable reputation;
    bytes32 public immutable projectId;
    uint64 public immutable votingDuration;
    uint64 public openedAt;
    uint64 public closedAt;
    State public state;

    mapping(address => bool) public hasVoted;
    uint256 public weightFor;
    uint256 public weightAgainst;

    event VotingOpened(bytes32 indexed projectId, uint64 openedAt, uint64 closesAt);
    event Voted(bytes32 indexed projectId, address indexed voter, Choice choice, uint256 weight);
    event VotingClosed(
        bytes32 indexed projectId, uint64 closedAt, uint256 weightFor, uint256 weightAgainst
    );

    error NotTeam();
    error InvalidState();
    error NotEligible();
    error AlreadyVoted();

    modifier onlyTeam() {
        if (msg.sender != team) revert NotTeam();
        _;
    }

    constructor(
        bytes32 projectId_,
        address submitter_,
        address team_,
        IReputationRegistry reputation_,
        uint64 votingDuration_
    ) {
        require(projectId_ != bytes32(0), "project id is zero");
        require(submitter_ != address(0), "submitter is zero");
        require(team_ != address(0), "team is zero");
        require(votingDuration_ > 0, "duration is zero");
        projectId = projectId_;
        submitter = submitter_;
        team = team_;
        reputation = reputation_;
        votingDuration = votingDuration_;
        state = State.Ready;
    }

    function openVoting() external onlyTeam {
        if (state != State.Ready) revert InvalidState();
        state = State.Voting;
        openedAt = _now();
        emit VotingOpened(projectId, openedAt, openedAt + votingDuration);
    }

    function castVote(Choice choice) external {
        if (state != State.Voting) revert InvalidState();
        if (_now() > openedAt + votingDuration) revert InvalidState();
        if (!reputation.isEligible(msg.sender)) revert NotEligible();
        if (hasVoted[msg.sender]) revert AlreadyVoted();

        uint256 weight = reputation.weightOf(msg.sender);
        hasVoted[msg.sender] = true;
        if (choice == Choice.For) weightFor += weight;
        else weightAgainst += weight;

        emit Voted(projectId, msg.sender, choice, weight);
    }

    function closeVoting() external onlyTeam {
        if (state != State.Voting) revert InvalidState();
        state = State.Closed;
        closedAt = _now();
        emit VotingClosed(projectId, closedAt, weightFor, weightAgainst);
    }

    function _now() private view returns (uint64) {
        return uint64(Time.timestamp());
    }
}
