pragma solidity ^0.4.11;

// @todo: figure out the correct fields for the copyright struct
contract CopyrightLedger {
    event NewCopyrightedSong(uint id, string ownerName, string ownerAddress, string description, string lyrics);
    struct CopyrightedSong {
        string copyrightName;
        string description;
        string lyrics; // limit size of lyrics 
        string 
        // ? do we need a timestamp?
    }

    CopyrightedSong[] public copyrightedSongs;
    mapping (uint => address) public copyrightedSongsToOwner;

    function _registerCopyright(string _ownerName, string _ownerAddress, string _description, string _lyrics) public {
        uint id = copyrightedSongs.push(CopyrightedSong(_ownerName, _ownerAddress, _description, _lyrics));
        copyrightedSongsToOwner[id] = msg.sender;
        emit NewCopyrightedSong(id, _ownerName, _ownerAddress, _description, _lyrics);
    }
}