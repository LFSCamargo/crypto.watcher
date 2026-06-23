// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { TimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title Timelock
/// @notice Timelock owner for MVP governance-controlled protocol operations. [MVP]
contract Timelock is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) { }
}
