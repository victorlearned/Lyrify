pragma solidity ^0.4.19;

import "./Ownable.sol";

// @todo: figure out the correct fields for the copyright struct
contract LyrifyTokenFactory is Ownable {
    event NewLyrifyToken(uint id, string ownerName, string songName, string lyrics);

    struct LyrifyToken {
        // string lastName;
        string ownerName;
        string songName;
        string lyrics; // @todo text is cheap, ipfs in future? 
        // ? do we need a timestamp?
    }

    LyrifyToken[] public lyrifyTokens;
    // helper attribute
    mapping(address => uint) ownerLyrifyTokenCount; // @todo limit uint to uint16?

    uint registrationFee = 0.004 ether; // 3 bux at the time of this contract
    mapping (uint => address) public lyrifyTokensToOwner;

    function setRegistrationFee(uint _fee) external onlyOwner {
        registrationFee = _fee;
    }

    function _createToken(string _ownerName, string _songName, string _lyrics) internal {
        uint id = lyrifyTokens.push(LyrifyToken(_ownerName, _songName, _lyrics)) - 1;
        lyrifyTokensToOwner[id] = msg.sender;
        ownerLyrifyTokenCount[msg.sender]++;
        emit NewLyrifyToken(id, _ownerName, _songName, _lyrics);
    }

    /// Anyone can call this function. Should this be updated so only the 
    /// contract creator can create this?? (to pay in USD/other sources, for example)
    function registerToken(string _ownerName,  string _songName, string _lyrics) public payable {
        require(msg.value == registrationFee);
        _createToken(_ownerName, _songName, _lyrics);
    }

    // Helper functions
    function getLyrifyTokensByOwner(address _owner) external view returns (uint[]) {
        uint[] memory result = new uint[](ownerLyrifyTokenCount[_owner]);
        uint counter = 0;
        for (uint i = 0; i < lyrifyTokens.length; i++) {
            if (lyrifyTokensToOwner[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

}
