// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IReputationRegistry} from "../reputation/interfaces/IReputationRegistry.sol";

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
    IReputationRegistry public immutable reputation;
    State public state;

    mapping(address => bool) public hasVoted;
    uint256 public weightFor;
    uint256 public weightAgainst;

    event VotingOpened();
    event Voted(address indexed voter, Choice choice, uint256 weight);
    event VotingClosed(uint256 weightFor, uint256 weightAgainst);

    error NotTeam();
    error InvalidState();
    error NotEligible();
    error AlreadyVoted();

    modifier onlyTeam() {
        if (msg.sender != team) revert NotTeam();
        _;
    }

    constructor(address team_, IReputationRegistry reputation_) {
        team = team_;
        reputation = reputation_;
        state = State.Ready;
    }

    function openVoting() external onlyTeam {
        if (state != State.Ready) revert InvalidState();
        state = State.Voting;
        emit VotingOpened();
    }

    function castVote(Choice choice) external {
        if (state != State.Voting) revert InvalidState();
        if (!reputation.isEligible(msg.sender)) revert NotEligible();
        if (hasVoted[msg.sender]) revert AlreadyVoted();

        uint256 weight = reputation.weightOf(msg.sender);
        hasVoted[msg.sender] = true;
        if (choice == Choice.For) weightFor += weight;
        else weightAgainst += weight;

        emit Voted(msg.sender, choice, weight);
    }

    function closeVoting() external onlyTeam {
        if (state != State.Voting) revert InvalidState();
        state = State.Closed;
        emit VotingClosed(weightFor, weightAgainst);
    }
}
