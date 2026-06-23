// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Test } from "forge-std/Test.sol";

/// @title ForkTest
/// @notice Base for integration tests that run against a real testnet fork. [MVP]
/// @dev Reads `SEPOLIA_RPC_URL` from the environment. When it is missing the
///      test is skipped (via `vm.skip`) so the default `forge test` run stays
///      green without network access. See docs/CONTRACTS.mdc.
abstract contract ForkTest is Test {
    /// @dev True when a fork was successfully selected in `setUp`.
    bool internal forkActive;

    /// @dev Skips the test body when no fork is available.
    modifier onlyFork() {
        if (!forkActive) {
            vm.skip(true);
            return;
        }
        _;
    }

    /// @dev Selects a fork for `alias_` when its RPC env var is configured.
    function _selectFork(string memory rpcEnvVar) internal {
        string memory rpcUrl = vm.envOr(rpcEnvVar, string(""));
        if (bytes(rpcUrl).length == 0) {
            forkActive = false;
            return;
        }
        vm.createSelectFork(rpcUrl);
        forkActive = true;
    }
}
