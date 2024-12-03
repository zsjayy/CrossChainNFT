// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;
    //metaData,有了这个之后，在铸造NFT的时候就可以用这个metaData的URI
    string constant META_DATA = "ipfs://ipfs/QmNkvXzMDrw5RZxgUMYCPYriTpt9QKJC8FYPwnULucV2UV";
    mapping(uint256=>bool) public isTokenIdExitStill;

    //通常合约的部署者就是Owner，所以可以直接用msg.sender，不用initialOwner
    constructor(string memory _NFTName,string memory _NFTSymbol)
        ERC721(_NFTName, _NFTSymbol)
        Ownable(msg.sender)
    {}

    event Minted(address indexed to, uint256 indexed tokenId);

    function safeMint(address to) public returns(uint256){
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, META_DATA);
        isTokenIdExitStill[tokenId] = true;
        emit Minted(to,tokenId);
        return tokenId;
    }

    // 新增函数以获取指定地址的所有 Token IDs  
    function getTokenIdsByOwner(address owner) public view returns (uint256[] memory) {  
        uint256 balance = balanceOf(owner);  
        uint256[] memory tokenIds = new uint256[](balance);  

        for (uint256 i = 0; i < balance; i++) {  
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);  
        }  

        return tokenIds;  
    } 

    function safeBurn(uint256 _tokenId) public returns(uint256){
        burn(_tokenId);
        isTokenIdExitStill[_tokenId] = false;
        return _tokenId;
    }

    function tokenIdIsExitOrNot(uint256 _tokenId) public view returns(bool){
        if(isTokenIdExitStill[_tokenId]){
            return true;
        }else{
            return false;
        }
    }
    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}