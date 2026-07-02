// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {GiftEscrow} from "../src/GiftEscrow.sol";
import {GiftEscrowFactory} from "../src/GiftEscrowFactory.sol";

contract GiftEscrowFactoryTest is Test {
    GiftEscrowFactory factory;
    address sender = address(0xA11CE);
    uint256 deadline;

    function setUp() public {
        factory = new GiftEscrowFactory();
        deadline = block.timestamp + 30 days;
        vm.deal(sender, 10 ether);
    }

    function test_CreateAndFundDeploysFundedEscrow() public {
        vm.prank(sender);
        address escrowAddr = factory.createAndFund{value: 1 ether}(deadline);

        GiftEscrow escrow = GiftEscrow(escrowAddr);
        assertEq(escrow.sender(), sender);
        assertEq(escrow.deadline(), deadline);
        assertEq(address(escrow).balance, 1 ether);
        assertEq(uint256(escrow.status()), uint256(GiftEscrow.Status.Funded));
    }

    function test_EachCallDeploysDistinctEscrow() public {
        vm.prank(sender);
        address a = factory.createAndFund{value: 1 ether}(deadline);
        vm.prank(sender);
        address b = factory.createAndFund{value: 1 ether}(deadline);
        assertTrue(a != b);
    }

    function test_EmitsGiftCreated() public {
        vm.prank(sender);
        vm.expectEmit(false, true, false, true);
        emit GiftEscrowFactory.GiftCreated(address(0), sender, deadline, 1 ether);
        factory.createAndFund{value: 1 ether}(deadline);
    }

    function test_ClaimWorksThroughFactoryDeployedEscrow() public {
        address recipient = address(0xB0B);
        vm.prank(sender);
        address escrowAddr = factory.createAndFund{value: 1 ether}(deadline);
        GiftEscrow(escrowAddr).claim(recipient);
        assertEq(recipient.balance, 1 ether);
    }
}
