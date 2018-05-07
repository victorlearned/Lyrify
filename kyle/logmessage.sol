pragma solidity ^0.4.0;

contract logMessage {

	struct Message {
		string message;
	}

	address public owner;
	string public message;

	mapping(address => Message) public messages;

	event Log(address _from, string message);

	function logMessage(address _from, string _message) public {
		owner = msg.sender;
		message = _message;
		emit Log(owner, message);
	}
}
