// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

interface  IAuctioneer {
    /*
        - Auction: 
            - End Time
            - Current price
            - High bidder
            - Settled
        - Functions
            - acceptBid
            - settleAuction
            - pauseAuction
            - unPauseAuction
    */

   struct Auction {
       uint256 startTime; 
       uint256 endTime; 
       uint256 highPrice; 
       address payable highBidder; 
       bool settled; 
   }

   event AuctionCreated(uint256 startTime, uint256 endTime, uint256 auction); 
   event BidCreated(address bidder, uint256 bid, uint256 time, uint256 auction);
   event SettleAuction(address winner, uint256 price, uint256 auction);
   
   // Take a bid for the current auction
   function bid() external payable; 


    // Settle the current auction and start a new one
    function settleStartAuction() external; 

}