// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {GiftEscrow} from "../src/GiftEscrow.sol";

/// @notice Full lifecycle in one broadcast: deploy -> fund -> claim. Produces
/// Funded and Claimed events on-chain so the demo has clickable proof that the
/// escrow logic runs for real, not just that the bytecode was deployed.
///
/// Env:
///   PRIVATE_KEY        deployer/sender key (also the funder)
///   DEMO_VALUE_WEI     amount to fund (default 0.0001 ether)
///   DEMO_RECIPIENT     claim destination (default: the sender address)
///
/// Usage:
///   forge script script/Demo.s.sol \
///     --rpc-url arbitrum_sepolia --broadcast
contract DemoGiftEscrow is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address sender = vm.addr(pk);
        uint256 value = vm.envOr("DEMO_VALUE_WEI", uint256(0.0001 ether));
        address recipient = vm.envOr("DEMO_RECIPIENT", sender);
        uint256 deadline = block.timestamp + 30 days;

        vm.startBroadcast(pk);
        GiftEscrow escrow = new GiftEscrow(sender, deadline);
        escrow.fund{value: value}();
        escrow.claim(recipient);
        vm.stopBroadcast();

        console.log("GiftEscrow:", address(escrow));
        console.log("sender:", sender);
        console.log("recipient:", recipient);
        console.log("funded+claimed wei:", value);
    }
}
