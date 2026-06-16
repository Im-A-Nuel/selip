// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GiftEscrow
/// @notice Holds a single gift's value and enforces its rule on-chain. Value
/// and rule live here, not in the database; that is the trustless differentiator
/// from a plain Web2 transfer. Cross-chain routing for funding and cash-out is
/// handled off-chain by the Universal Accounts SDK, not by this contract.
///
/// MVP rule: refund to the sender if the gift is not claimed before `deadline`.
/// Refund execution can be automated via a ZeroDev session-key permission, so
/// no manual sender signature is needed at refund time.
contract GiftEscrow {
    address public immutable sender;
    uint256 public immutable deadline; // unix seconds; claim must happen before
    uint256 public amount;

    enum Status {
        Empty,
        Funded,
        Claimed,
        Refunded
    }

    Status public status;

    event Funded(address indexed sender, uint256 amount);
    event Claimed(address indexed recipient, uint256 amount);
    event Refunded(address indexed sender, uint256 amount);

    error NotSender();
    error WrongStatus();
    error TooEarly();
    error Expired();
    error ZeroAmount();
    error TransferFailed();

    constructor(address _sender, uint256 _deadline) {
        sender = _sender;
        deadline = _deadline;
        status = Status.Empty;
    }

    /// @notice Lock the gift value into escrow. Callable once.
    function fund() external payable {
        if (status != Status.Empty) revert WrongStatus();
        if (msg.value == 0) revert ZeroAmount();
        amount = msg.value;
        status = Status.Funded;
        emit Funded(msg.sender, msg.value);
    }

    /// @notice Transfer the value to `recipient`. Valid only while funded and
    /// before the deadline. The caller authorization (recipient session) is
    /// enforced by the smart-account permission layer that owns this escrow.
    function claim(address recipient) external {
        if (status != Status.Funded) revert WrongStatus();
        if (block.timestamp >= deadline) revert Expired();
        uint256 value = amount;
        status = Status.Claimed;
        amount = 0;
        (bool sentOk, ) = payable(recipient).call{value: value}("");
        if (!sentOk) revert TransferFailed();
        emit Claimed(recipient, value);
    }

    /// @notice Return the value to the sender. Valid only after the deadline
    /// lapses with no claim.
    function refund() external {
        if (status != Status.Funded) revert WrongStatus();
        if (block.timestamp < deadline) revert TooEarly();
        uint256 value = amount;
        status = Status.Refunded;
        amount = 0;
        (bool sentOk, ) = payable(sender).call{value: value}("");
        if (!sentOk) revert TransferFailed();
        emit Refunded(sender, value);
    }
}
