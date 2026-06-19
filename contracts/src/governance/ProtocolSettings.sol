// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProtocolSettings
/// @notice Minimal governance-controlled parameters for MVP voting. [MVP]
contract ProtocolSettings is Ownable {
    uint256 public votingDuration;
    uint256 public reputationThreshold;

    event VotingDurationSet(uint256 votingDuration);
    event ReputationThresholdSet(uint256 reputationThreshold);

    constructor(address owner_, uint256 votingDuration_, uint256 reputationThreshold_)
        Ownable(owner_)
    {
        _setVotingDuration(votingDuration_);
        _setReputationThreshold(reputationThreshold_);
    }

    function setVotingDuration(uint256 votingDuration_) external onlyOwner {
        _setVotingDuration(votingDuration_);
    }

    function setReputationThreshold(uint256 reputationThreshold_) external onlyOwner {
        _setReputationThreshold(reputationThreshold_);
    }

    function _setVotingDuration(uint256 votingDuration_) private {
        require(votingDuration_ > 0, "voting duration is zero");
        votingDuration = votingDuration_;
        emit VotingDurationSet(votingDuration_);
    }

    function _setReputationThreshold(uint256 reputationThreshold_) private {
        reputationThreshold = reputationThreshold_;
        emit ReputationThresholdSet(reputationThreshold_);
    }
}
