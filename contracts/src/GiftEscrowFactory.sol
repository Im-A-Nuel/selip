// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {GiftEscrow} from "./GiftEscrow.sol";

/// @title GiftEscrowFactory
/// @notice Deploys and funds one GiftEscrow per gift in a single transaction, so
/// the sender's wallet (routed cross-chain by the Universal Accounts SDK) only
/// signs once. The backend never holds a key to deploy on the sender's behalf;
/// this factory is the thing the sender's own transaction calls.
contract GiftEscrowFactory {
    event GiftCreated(
        address indexed escrow,
        address indexed sender,
        uint256 deadline,
        uint256 amount
    );

    /// @notice Deploy a fresh GiftEscrow for `msg.sender` and fund it with
    /// `msg.value` in the same transaction.
    function createAndFund(uint256 deadline) external payable returns (address escrow) {
        GiftEscrow gift = new GiftEscrow(msg.sender, deadline);
        gift.fund{value: msg.value}();
        emit GiftCreated(address(gift), msg.sender, deadline, msg.value);
        return address(gift);
    }
}
