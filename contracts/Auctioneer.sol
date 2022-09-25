// TODO: Look into reentrancy
// TODO: Look into pausable
// TODO: Consider adding a time buffer

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "./intefaces/IAuctioneer.sol";
import "./intefaces/ISoulGenToken.sol"; 
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IWETH } from './intefaces/IWETH.sol';


contract Auctioneer is IAuctioneer {
    
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner");
        _;
    }

    address private owner; 
    ISoulGenToken private soulGen;
    IAuctioneer.Auction public auction; 
    uint256 private auctionCount; 
    uint256 public reservePrice; 
    address public weth;
    uint256 public auctionLength; 
    uint256 public initialAuctionLength;

    constructor() {
        owner = msg.sender; 
    }

    function initialize(ISoulGenToken _soulGen
            , uint256 _reservePrice
            , address _weth
            , uint256 _initialAuctionLength 
            , uint256 _auctionLength
        ) public onlyOwner {
        soulGen = _soulGen; 
        reservePrice = _reservePrice; 
        weth = _weth; 
        initialAuctionLength = _initialAuctionLength; 
        auctionLength = _auctionLength; 
        _createAuction();
    }

    function _createAuction() internal {
        IAuctioneer.Auction memory _auction; 
        // Get the current timebuffer
        auctionCount = auctionCount + 1; 
        uint256 buffer = _getTimeBuffer(); 

        _auction = IAuctioneer.Auction({
            startTime: block.timestamp, 
            endTime: block.timestamp + buffer, 
            highPrice: reservePrice, 
            highBidder: payable(0), 
            settled: false
        }); 

        auction = _auction; 

        emit AuctionCreated(auction.startTime, auction.endTime, auctionCount);
    }

    function bid() public payable {
        IAuctioneer.Auction memory _auction = auction; 
        // Check that the auction is active
        require(auction.settled == false, 'Auction has already been settled');
        // Check that the auction isn't over
        require(block.timestamp < _auction.endTime, 'Auction expired');
        // Check that the amount bid is more than the current high bid
        require(msg.value > _auction.highPrice, 'Bid must be higher than current bid');
        // Check that the bidder has not minted before
        // TODO: Implement this

        // Refund the previous high bidder if it's not address 0
        address payable prevHighBidder = _auction.highBidder;
        if (prevHighBidder != payable(0)) {
            _safeTransferETHWithFallback(prevHighBidder, _auction.highPrice);
        }
        // Update the bid
        auction.highPrice = msg.value;
        auction.highBidder = payable(msg.sender);

        emit BidCreated(msg.sender, msg.value, block.timestamp, auctionCount);
    }

    function settleStartAuction() public {
        _settleAuction();
        _createAuction();        
    }

    function _settleAuction() internal {
        IAuctioneer.Auction memory _auction = auction;
        // Check that the auction has expired
        require(block.timestamp > _auction.endTime, "Auction not expired");
        // Check that the auction has at least one bid
        require(_auction.highBidder != payable(0), "No bids on auction");
        // Mark the auction as settled
        auction.settled = true; 
        // Call the mint function on the SoulGen contract
        soulGen.mintSoulGen(_auction.highBidder);
        if (_auction.highPrice > 0) {
            _safeTransferETHWithFallback(owner, _auction.highPrice);
        }
        emit SettleAuction(_auction.highBidder, _auction.highPrice, auctionCount);
    }

    function _getTimeBuffer() internal view returns (uint256 buffer) {
        if(auctionCount <= 500) buffer = initialAuctionLength; 
        else buffer = auctionLength; 
    }

    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWETH(weth).deposit{ value: amount }();
            IERC20(weth).transfer(to, amount);
        }
    }

    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        (bool success, ) = to.call{ value: value, gas: 30_000 }(new bytes(0));
        return success;
    }

    function updateOwner(address newOwner) public onlyOwner {
        owner = newOwner; 
    }

    function getOwner() public view returns (address _owner) { _owner = owner; }
    function getAuction() public view returns(IAuctioneer.Auction memory _auction) { _auction = auction; }
}