// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {GiftEscrow} from "../src/GiftEscrow.sol";

contract GiftEscrowTest is Test {
    GiftEscrow escrow;
    address sender = address(0xA11CE);
    address recipient = address(0xB0B);
    uint256 deadline;

    function setUp() public {
        deadline = block.timestamp + 30 days;
        vm.prank(sender);
        escrow = new GiftEscrow(sender, deadline);
        vm.deal(sender, 10 ether);
    }

    function _fund(uint256 value) internal {
        vm.prank(sender);
        escrow.fund{value: value}();
    }

    function test_FundLocksValue() public {
        _fund(1 ether);
        assertEq(address(escrow).balance, 1 ether);
        assertEq(uint256(escrow.status()), uint256(GiftEscrow.Status.Funded));
    }

    function test_ClaimTransfersToRecipient() public {
        _fund(1 ether);
        escrow.claim(recipient);
        assertEq(recipient.balance, 1 ether);
        assertEq(uint256(escrow.status()), uint256(GiftEscrow.Status.Claimed));
    }

    function test_ClaimFailsAfterDeadline() public {
        _fund(1 ether);
        vm.warp(deadline + 1);
        vm.expectRevert(GiftEscrow.Expired.selector);
        escrow.claim(recipient);
    }

    function test_RefundFailsBeforeDeadline() public {
        _fund(1 ether);
        vm.expectRevert(GiftEscrow.TooEarly.selector);
        escrow.refund();
    }

    function test_RefundReturnsToSenderAfterDeadline() public {
        _fund(1 ether);
        uint256 before = sender.balance;
        vm.warp(deadline + 1);
        escrow.refund();
        assertEq(sender.balance, before + 1 ether);
        assertEq(uint256(escrow.status()), uint256(GiftEscrow.Status.Refunded));
    }

    function test_CannotDoubleClaim() public {
        _fund(1 ether);
        escrow.claim(recipient);
        vm.expectRevert(GiftEscrow.WrongStatus.selector);
        escrow.claim(recipient);
    }

    function test_FundRejectsZero() public {
        vm.prank(sender);
        vm.expectRevert(GiftEscrow.ZeroAmount.selector);
        escrow.fund{value: 0}();
    }
}
