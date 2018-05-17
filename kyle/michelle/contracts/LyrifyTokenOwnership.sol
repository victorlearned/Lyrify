pragma solidity ^0.4.19;

import "./ERC721.sol";
import "./LyrifyTokenFactory.sol";

// @todo: figure out the correct fields for the copyright struct
contract LyrifyTokenOwnership is LyrifyTokenFactory, ERC721 {

    mapping (uint => address) lyrifyTokenApprovals;

    function balanceOf(address _owner) public view returns (uint256 _balance) {
        return ownerLyrifyTokenCount[_owner];
    }

    function ownerOf(uint256 _tokenId) public view returns (address _owner) {
        return lyrifyTokensToOwner[_tokenId];
    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        ownerLyrifyTokenCount[_to]++; // use safemath!! = ownerLyrifyTokenCount[_to].add(1);
        ownerLyrifyTokenCount[msg.sender]--; // use safemath!! = ownerLyrifyTokenCount[msg.sender].sub(0);
        lyrifyTokensToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

//  add owner only of token (not contract) check ... 
    function transfer(address _to, uint256 _tokenId) public { //public owner(_tokenId) {
        _transfer(msg.sender, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) public { // public owner(_tokenId) {
        lyrifyTokenApprovals[_tokenId] = _to;
        emit Approval(msg.sender, _to, _tokenId);
    }

    function takeOwnership(uint256 _tokenId) public {
        require(lyrifyTokenApprovals[_tokenId] == msg.sender);
        address owner = ownerOf(_tokenId);
        _transfer(owner, msg.sender, _tokenId);
    }
}
