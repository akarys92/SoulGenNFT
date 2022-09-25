// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface ISoulGenToken is IERC721 {
    // Events
    event Mint(address creator, uint256 tokenId);
    event URIUpdate(uint256 tokenId, string newURI); 
    event Update(string updateType, address newAddress); 

    // Functions 
    function mintSoulGen(address creator) external; 
    function getURI(uint256 tokenId) external returns (string memory uri);
    function updateTokenURI(uint256 tokenId, string calldata uri) external; 
}