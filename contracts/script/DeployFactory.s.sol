// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {GiftEscrowFactory} from "../src/GiftEscrowFactory.sol";

/// @notice Deploys the GiftEscrowFactory once. Every gift after this reuses the
/// same factory address; the factory itself deploys a fresh GiftEscrow per gift.
///
/// Usage:
///   forge script script/DeployFactory.s.sol \
///     --rpc-url arbitrum_sepolia --broadcast --verify
contract DeployGiftEscrowFactory is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        GiftEscrowFactory factory = new GiftEscrowFactory();
        vm.stopBroadcast();
        console.log("GiftEscrowFactory deployed:", address(factory));
    }
}
