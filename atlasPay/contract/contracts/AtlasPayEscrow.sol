// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AtlasPayEscrow {
    struct Escrow {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timeoutBlock;
        bool confirmed;
        bool refunded;
    }

    mapping(bytes32 => Escrow) public escrows;

    event FundsDeposited(
        bytes32 indexed txId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timeout
    );

    event FundsReleased(
        bytes32 indexed txId,
        address indexed receiver,
        uint256 amount
    );

    event FundsRefunded(
        bytes32 indexed txId,
        address indexed sender,
        uint256 amount
    );

    function deposit(address _receiver, uint256 _timeoutBlocks) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_receiver != address(0), "Invalid receiver address");
        require(_timeoutBlocks > 0, "Timeout must be greater than 0");

        bytes32 txId = keccak256(
            abi.encodePacked(msg.sender, _receiver, msg.value, block.number)
        );

        require(escrows[txId].amount == 0, "Transaction already exists");

        escrows[txId] = Escrow({
            sender: msg.sender,
            receiver: _receiver,
            amount: msg.value,
            timeoutBlock: block.number + _timeoutBlocks,
            confirmed: false,
            refunded: false
        });

        emit FundsDeposited(
            txId,
            msg.sender,
            _receiver,
            msg.value,
            block.number + _timeoutBlocks
        );
    }

    function confirmSettlement(bytes32 _txId) external {
        Escrow storage escrow = escrows[_txId];

        require(escrow.amount > 0, "Transaction does not exist");
        require(!escrow.confirmed, "Already confirmed");
        require(!escrow.refunded, "Already refunded");
        require(block.number <= escrow.timeoutBlock, "Transaction expired");

        escrow.confirmed = true;

        (bool success, ) = escrow.receiver.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_txId, escrow.receiver, escrow.amount);
    }

    function refund(bytes32 _txId) external {
        Escrow storage escrow = escrows[_txId];

        require(escrow.amount > 0, "Transaction does not exist");
        require(!escrow.confirmed, "Already confirmed");
        require(!escrow.refunded, "Already refunded");
        require(block.number > escrow.timeoutBlock, "Timeout not reached");
        require(msg.sender == escrow.sender, "Only sender can refund");

        escrow.refunded = true;

        (bool success, ) = escrow.sender.call{value: escrow.amount}("");
        require(success, "Refund failed");

        emit FundsRefunded(_txId, escrow.sender, escrow.amount);
    }

    function getEscrow(bytes32 _txId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        uint256 timeoutBlock,
        bool confirmed,
        bool refunded
    ) {
        Escrow memory escrow = escrows[_txId];
        return (
            escrow.sender,
            escrow.receiver,
            escrow.amount,
            escrow.timeoutBlock,
            escrow.confirmed,
            escrow.refunded
        );
    }
}
