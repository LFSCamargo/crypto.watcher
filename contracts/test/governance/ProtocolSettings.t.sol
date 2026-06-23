// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Test } from "forge-std/Test.sol";
import { ProtocolSettings } from "../../src/governance/ProtocolSettings.sol";

contract ProtocolSettingsTest is Test {
    ProtocolSettings internal settings;

    address internal owner = makeAddr("owner");
    address internal outsider = makeAddr("outsider");

    function setUp() public {
        settings = new ProtocolSettings(owner, 1);
    }

    function test_initialMethodologyVersion() public view {
        assertEq(settings.methodologyVersion(), 1);
    }

    function test_ownerCanBumpVersion() public {
        vm.prank(owner);
        settings.setMethodologyVersion(2);
        assertEq(settings.methodologyVersion(), 2);
    }

    function test_nonOwnerCannotBump() public {
        vm.prank(outsider);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, outsider)
        );
        settings.setMethodologyVersion(2);
    }

    function test_versionMustStrictlyIncrease() public {
        vm.startPrank(owner);
        vm.expectRevert(ProtocolSettings.InvalidMethodologyVersion.selector);
        settings.setMethodologyVersion(1);
        vm.stopPrank();
    }

    function test_constructorRejectsZeroVersion() public {
        vm.expectRevert(ProtocolSettings.InvalidMethodologyVersion.selector);
        new ProtocolSettings(owner, 0);
    }
}
