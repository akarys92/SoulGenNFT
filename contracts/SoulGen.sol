// TODO: Creator fee doesn't seem to be working on opensea
// TODO: Create inteface
// TODO: Document functions

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import { Base64 } from "./libraries/Base64.sol";
import "./libraries/ERC2981PerTokenRoyalties.sol";
import "./intefaces/ISoulGenToken.sol";

contract SoulGen is ISoulGenToken, ERC721URIStorage, ERC2981PerTokenRoyalties {
    // Set Roles & Permissions
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner");
        _;
    }
    modifier onlyAuctioneer {
        require(msg.sender == auctioneer, "Only auctioneer");
        _;
    }
    modifier onlyUpdater {
        require(msg.sender == updater, "Only updater");
        _;
    }

    address private owner; 
    address private auctioneer; 
    address private updater; 
    uint256 public lastUpdated; 
    // Base fee for royalties on secondary sales. Updatable by owner
    uint256 public baseFee = 500; 

    // Generic URI
    string private genericURI = "ipfs://Qmbjy2Lz3iRyRCmGDZbuzve7gKuF6gPL5AyAzhnUPkrJDF"; 
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    // TODO: Update these names
    constructor(address _auctioneer, address _updater) ERC721 ("SoulGenTest", "SoulGenTest") {
        owner = msg.sender; 
        auctioneer = _auctioneer; 
        updater = _updater; 
    }

    function updateTokenURI(uint256 tokenId, string calldata uri) public onlyUpdater {
        require(tokenId <= _tokenIds.current(), "Token does not exit!" );
        _setTokenURI(tokenId, uri);
        lastUpdated = tokenId; 
        emit URIUpdate(tokenId, uri);
    }

    function mintSoulGen(address creator) public onlyAuctioneer {
        // Each address can only mint one SoulGen
        require(balanceOf(creator) == 0, "Address already minted!");

        uint256 newItemId = _tokenIds.current();
        _safeMint(creator, newItemId);
        // Set ERC2981 royalties to the creator
        _setTokenRoyalty(newItemId, creator, 500);
        // Sets a generic URI that will be updated async
        _setTokenURI(newItemId, genericURI);
        // Emit a mint event
        emit Mint(creator, newItemId); 
    }

    function getURI(uint256 tokenId) public view returns (string memory uri) {
        uri = tokenURI(tokenId); 
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981Base, IERC165) returns (bool) {
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }

    // Update Functions
    function updateOwner(address newOwner) public onlyOwner {
        owner = newOwner; 
        emit Update("Owner", newOwner);
    }

    function updateAuctioneer(address newAuctioneer) public onlyOwner {
        auctioneer = newAuctioneer; 
        emit Update("Auctioneer", newAuctioneer);
    }

    function updateUpdater(address newUpdater) public onlyOwner {
        updater = newUpdater; 
        emit Update("Updater", newUpdater);
    }

    function updateBaseFee(uint256 newBaseFee) public onlyOwner {
        baseFee = newBaseFee; 
    }

    // Getters
    function getOwner() public view returns (address _owner) { _owner = owner; }
    function getAuctioneer() public view returns (address _auctioneer) { _auctioneer = auctioneer; }
    function getUpdater() public view returns (address _updater) { _updater = updater; }
    function getLastUpdated() public view returns (uint256 _lastUpdated) { _lastUpdated = lastUpdated; }
}