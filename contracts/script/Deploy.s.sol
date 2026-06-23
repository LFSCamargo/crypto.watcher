// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { CryptoWatcherGovernor } from "../src/governance/CryptoWatcherGovernor.sol";
import { GovernanceToken } from "../src/governance/GovernanceToken.sol";
import { ProtocolSettings } from "../src/governance/ProtocolSettings.sol";
import { Timelock } from "../src/governance/Timelock.sol";
import { ReputationRegistry } from "../src/reputation/ReputationRegistry.sol";
import { ProjectWatcherFactory } from "../src/review/ProjectWatcherFactory.sol";

/// @notice MVP deployment: governance (token + timelock + governor), reputation
///         (council credential) registry, the backend-controlled project-review
///         factory and protocol settings.
/// @dev Parameters are overridable via environment variables so the same script
///      works for local anvil and public testnets. Governance (the timelock)
///      owns the pausable/parameter surfaces after deployment.
contract Deploy is Script {
    struct Params {
        address admin;
        address backend;
        uint256 initialSupply;
        uint256 timelockDelay;
        uint256 minReputationWeight;
        uint32 methodologyVersion;
        uint48 votingDelay;
        uint32 votingPeriod;
        uint256 proposalThreshold;
        uint256 quorumFraction;
    }

    struct Addresses {
        address token;
        address timelock;
        address governor;
        address reputation;
        address factory;
        address backend;
        address settings;
    }

    function run() external {
        Params memory p = _readParams();
        Addresses memory a = _deploy(p);
        _log(a);
        _record(a);
    }

    function _readParams() internal view returns (Params memory p) {
        p.admin = msg.sender;
        // Platform backend allowed to emit project contracts. Defaults to the
        // deployer for local runs; set BACKEND_SUBMITTER on real networks.
        p.backend = vm.envOr("BACKEND_SUBMITTER", msg.sender);
        p.initialSupply = vm.envOr("INITIAL_SUPPLY", uint256(100_000_000 ether));
        p.timelockDelay = vm.envOr("TIMELOCK_MIN_DELAY", uint256(1 days));
        p.minReputationWeight = vm.envOr("MIN_REPUTATION_WEIGHT", uint256(1));
        p.methodologyVersion = uint32(vm.envOr("METHODOLOGY_VERSION", uint256(1)));
        p.votingDelay = uint48(vm.envOr("GOV_VOTING_DELAY", uint256(1)));
        p.votingPeriod = uint32(vm.envOr("GOV_VOTING_PERIOD", uint256(50_400)));
        // Non-zero by default to prevent proposal spam (0.1% of default supply).
        p.proposalThreshold = vm.envOr("GOV_PROPOSAL_THRESHOLD", uint256(100_000 ether));
        p.quorumFraction = vm.envOr("GOV_QUORUM_FRACTION", uint256(4));
    }

    function _deploy(Params memory p) internal returns (Addresses memory a) {
        vm.startBroadcast();

        // Governance: token + timelock + governor.
        GovernanceToken token = new GovernanceToken(p.admin, p.initialSupply);
        // Activate the deployer's voting power so governance is usable post-deploy.
        // NOTE: distribute tokens to the treasury/council before mainnet so a
        // single deployer does not unilaterally control governance.
        token.delegate(p.admin);

        Timelock timelock = _deployTimelock(p);
        CryptoWatcherGovernor governor = new CryptoWatcherGovernor(
            token, timelock, p.votingDelay, p.votingPeriod, p.proposalThreshold, p.quorumFraction
        );
        _wireGovernance(timelock, address(governor), p.admin);

        // Council registry + protocol settings + project review factory.
        // The timelock is both the operating team and the factory owner so that
        // lifecycle control and the pause switch are governance-controlled.
        ReputationRegistry reputation =
            new ReputationRegistry(address(timelock), p.minReputationWeight);
        ProtocolSettings settings = new ProtocolSettings(address(timelock), p.methodologyVersion);
        ProjectWatcherFactory factory = new ProjectWatcherFactory(
            address(timelock), reputation, settings, address(timelock), p.backend
        );

        vm.stopBroadcast();

        a = Addresses({
            token: address(token),
            timelock: address(timelock),
            governor: address(governor),
            reputation: address(reputation),
            factory: address(factory),
            backend: p.backend,
            settings: address(settings)
        });
    }

    function _deployTimelock(Params memory p) internal returns (Timelock) {
        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        return new Timelock(p.timelockDelay, proposers, executors, p.admin);
    }

    /// @dev Hand timelock control to the governor and renounce the deployer admin.
    function _wireGovernance(Timelock timelock, address governor, address admin) internal {
        timelock.grantRole(timelock.PROPOSER_ROLE(), governor);
        timelock.grantRole(timelock.EXECUTOR_ROLE(), governor);
        timelock.grantRole(timelock.CANCELLER_ROLE(), governor);
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), admin);
    }

    function _log(Addresses memory a) internal pure {
        console2.log("GovernanceToken:      ", a.token);
        console2.log("Timelock:             ", a.timelock);
        console2.log("CryptoWatcherGovernor:", a.governor);
        console2.log("ReputationRegistry:   ", a.reputation);
        console2.log("ProtocolSettings:     ", a.settings);
        console2.log("ProjectWatcherFactory:", a.factory);
        console2.log("Factory backend:      ", a.backend);
    }

    /// @dev Persist deployed addresses to `deployments/<network>.json` so the
    ///      apps/team don't need to re-deploy or hunt for addresses.
    function _record(Addresses memory a) internal {
        string memory key = "deployment";
        vm.serializeUint(key, "chainId", block.chainid);
        vm.serializeAddress(key, "governanceToken", a.token);
        vm.serializeAddress(key, "timelock", a.timelock);
        vm.serializeAddress(key, "governor", a.governor);
        vm.serializeAddress(key, "reputationRegistry", a.reputation);
        vm.serializeAddress(key, "protocolSettings", a.settings);
        vm.serializeAddress(key, "projectWatcherFactory", a.factory);
        string memory out = vm.serializeAddress(key, "factoryBackend", a.backend);

        string memory path = string.concat("deployments/", _network(), ".json");
        vm.writeJson(out, path);
        console2.log("Saved deployment to:  ", path);
    }

    function _network() internal view returns (string memory) {
        if (block.chainid == 84_532) return "base-sepolia";
        if (block.chainid == 11_155_111) return "sepolia";
        if (block.chainid == 8453) return "base";
        if (block.chainid == 1) return "mainnet";
        return vm.toString(block.chainid);
    }
}
