// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestContract {
    string public message;

    // Constructor to initialize the message
    constructor(string memory _initialMessage) {
        message = _initialMessage;
    }

    // Function to update the message
    function setMessage(string memory _newMessage) public {
        message = _newMessage;
    }

    // Function to retrieve the current message
    function getMessage() public view returns (string memory) {
        return message;
    }
}
