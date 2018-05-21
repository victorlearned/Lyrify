///////////////////////////////////////////////
//=> FOR EXPERIMENTAL PURPOSES ONLY - kyle
///////////////////////////////////////////////

pragma solidity ^0.4.10;

contract Lyrics {

    struct LyricPost {
        string lyrics;
        address sender;
        bool set;
    }

    mapping (address => LyricPost) public LyricPosts;

    address[] keys;

    function getKeyArray() constant returns (address[]) {
        return keys;
    }     

}
