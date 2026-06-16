// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {GiftEscrow} from "../src/GiftEscrow.sol";

/// @notice Deploys one GiftEscrow. In production a fresh escrow is deployed per
/// gift; this script deploys a single instance for testing on Arbitrum.
///
/// Usage:
///   forge script script/Deploy.s.sol \
///     --rpc-url arbitrum_sepolia --broadcast --verify
contract DeployGiftEscrow is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address sender = vm.addr(pk);
        uint256 deadline = block.timestamp + 30 days;

        vm.startBroadcast(pk);
        GiftEscrow escrow = new GiftEscrow(sender, deadline);
        vm.stopBroadcast();

        console.log("GiftEscrow deployed:", address(escrow));
        console.log("sender:", sender);
        console.log("deadline:", deadline);
    }
}
