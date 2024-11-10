// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

//由于WrappMyToken和MyToken基本一样，只需要加一歇Wrapped的函数，所以可以直接引入MyToken合约
import {MyToken} from "./MyToken.sol";
contract WrappedMyToken is MyToken{
    constructor(string memory _NFTName,string memory _NFTSymbol) MyToken(_NFTName,_NFTSymbol){

    }

    function mintTokenWithSpecificTokenId(address to,uint256 tokenId) public {
        _safeMint(to,tokenId);

    }
}