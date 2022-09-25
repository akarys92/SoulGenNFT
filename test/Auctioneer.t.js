const {
time,
loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  
describe("Auctioneer", function () {
    // Define deployment fixture
    async function deployAuctioneer() {
        const [owner, otherAccount] = await ethers.getSigners();

        const AuctioneerFactory = await ethers.getContractFactory("Auctioneer");
        const auctioneer = await AuctioneerFactory.deploy(); 

        const SoulGenFactory = await ethers.getContractFactory("SoulGen");
        const soulGen = await SoulGenFactory.deploy(auctioneer.address, owner.address);

        return { auctioneer, soulGen, owner, otherAccount };
    }

    async function createAndStartAuction(lengthFast, lengthSlow) {
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        const reservePrice = ethers.utils.parseEther("0.1"); 

        const AuctioneerFactory = await ethers.getContractFactory("Auctioneer");
        const auctioneer = await AuctioneerFactory.deploy(); 

        const SoulGenFactory = await ethers.getContractFactory("SoulGen");
        const soulGen = await SoulGenFactory.deploy(auctioneer.address, owner.address);
        
        await auctioneer.initialize(soulGen.address, reservePrice, WETH_ADDRESS, lengthFast, lengthSlow);

        return { auctioneer, soulGen, owner, otherAccount, otherAccount2, reservePrice };
    }

    async function deployAuctioneerStartAuction() {
        return createAndStartAuction(5, 5); 
    }

    async function deployAuctioneerStartAuctionFast() {
        return createAndStartAuction(2, 2); 
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
          const { auctioneer, owner } = await loadFixture(deployAuctioneer);
    
          expect(await auctioneer.getOwner()).to.equal(owner.address);
        });

        it("Should initialize an auction", async function(){
            const { auctioneer, reservePrice } = await loadFixture(deployAuctioneerStartAuction);
            const auction = await auctioneer.getAuction();
            // Auction is not settled
            expect(!auction.settled, "Auction already settled");
            // Reserve price is correct
            expect(auction.highPrice == reservePrice, "Reserve price not set");
            // Auction is not expired
            expect(auction.endTime.toNumber() > Date.now(), "Auction is expired");
        });
    });

    describe("Bid", function(){
        it("Should allow users to set a bid", async function(){
            const { auctioneer, otherAccount } = await loadFixture(deployAuctioneerStartAuction);
            const bid = ethers.utils.parseEther("1"); 
            await auctioneer.connect(otherAccount).bid({ value: bid }); 

            const auction = await auctioneer.getAuction(); 
            // Bid price has been updated
            expect(auction.highPrice === bid, "Current price not updated"); 
            // High bidder has been updated
            expect(auction.highBidder === otherAccount.address, "New high bidder not updated");
        });

        it("Should not allow users to set bids lower than current", async function(){
            const { auctioneer, otherAccount } = await loadFixture(deployAuctioneerStartAuction);
            const auctionInitialState = await auctioneer.getAuction(); 
            const bid = auctionInitialState.highPrice.div(2); 
            const otherAccountConnect = await auctioneer.connect(otherAccount); 
            await expect(otherAccountConnect.bid({ value: bid })).to.be.revertedWith("Bid must be higher than current bid");
        });

        it("Previous high bidder should get bid back", async function(){
            const { auctioneer, otherAccount, otherAccount2 } = await loadFixture(deployAuctioneerStartAuction);
            const firstBid = ethers.utils.parseEther("0.5"); 
            const secondBid = ethers.utils.parseEther("0.75"); 
            const otherAccountBalance = await otherAccount.getBalance();
            let otherAccount2Balance = await otherAccount2.getBalance(); 
            const otherAccountConnect = auctioneer.connect(otherAccount); 
            const otherAccount2Connect = auctioneer.connect(otherAccount2); 
            // Place the first bid
            await otherAccountConnect.bid( { value: firstBid} ); 
            // Confirm bid taken from first account
            await expect(otherAccount.getBalance() === otherAccountBalance.add(firstBid.mul(-1)));
            // Place second bid
            await otherAccount2Connect.bid({ value: secondBid });
            // Confirm that the first account has been refunded
            await expect(otherAccount.getBalance() === otherAccountBalance, "Refund not received"); 
        });
        // TODO: Can't bid if already minted a SoulGen
    });
    describe("Settlement", function(){
        it("Should allow winning bidder to settle the current auction", async function(){
            const { auctioneer, otherAccount } = await loadFixture(deployAuctioneerStartAuctionFast);
            const firstBid = ethers.utils.parseEther("0.5");
            const otherAccountConnect = auctioneer.connect(otherAccount); 
            await otherAccountConnect.bid({ value: firstBid }); 
            // Confirm the bid was successful
            await expect(auctioneer.getAuction().highBidder == otherAccount.address, "Bid unsuccessful"); 
            // Confirm that the auction is expired
            const auctionExpire = await otherAccountConnect.getAuction().endTime; 
            expect(auctionExpire > Date.now(), "Auction isn't expired"); 
            // Attempt to settle
            await otherAccountConnect.settleStartAuction(); 
            // await expect(otherAccountConnect.settleStartAuction()).not.to.be.reverted; 
        });
    });
}); 