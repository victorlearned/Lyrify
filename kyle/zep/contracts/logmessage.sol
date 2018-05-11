pragma solidity ^0.4.0;

import '../../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract LyricfyToken is StandardToken {
	string public name = 'LyricfyToken';
	string public symbol = 'LFY';
	address public owner;
	string public message;

	mapping(address => Message) public messages;

	event Log(address _from, string message);

	function LyricfyToken() public {
		totalSupply_ = INITIAL_SUPPLY;
		balance[msg.sender] = INITIAL_SUPPLY;
	}

	function logMessage(address _from, string _message) public {
		owner = msg.sender;
		message = _message;
		emit Log(owner, message);
	}
}


