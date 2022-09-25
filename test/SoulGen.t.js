const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("SoulGen", function () {
  // Define deployment fixture
  async function deploySoulGenToken() {
    const [owner, otherAccount] = await ethers.getSigners();

    const SoulGenFactory = await ethers.getContractFactory("SoulGen");
    const soulGen = await SoulGenFactory.deploy(owner.address, owner.address);

    return { soulGen, owner, otherAccount };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);

      expect(await soulGen.getOwner()).to.equal(owner.address);
    });

    it("Should set the right auctioneer", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);

      expect(await soulGen.getAuctioneer()).to.equal(owner.address);
    });

    it("Should set the right updater", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);      
    });
  });

  describe("Minting", function () {
    it("Only Auctioneer can mint", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateAuctioneer(otherAccount.address); 
      await expect(soulGen.mintSoulGen(owner.address)).to.be.revertedWith(
        "Only auctioneer"
      );
    });

    it("Can only create one NFT per creator", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);
      // Call the function.
      let txn = await soulGen.mintSoulGen(owner.address)
      // Wait for it to be mined.
      await txn.wait()

      await expect(soulGen.mintSoulGen(owner.address)).to.be.revertedWith(
        "Address already minted!"
      );
    });

    it("Sets initial URI", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);
      let txn = await soulGen.mintSoulGen(owner.address); 
      // Wait for it to be mined.
      await txn.wait();
      let uri = await soulGen.getURI(0)
      expect(uri).to.equal("ipfs://Qmbjy2Lz3iRyRCmGDZbuzve7gKuF6gPL5AyAzhnUPkrJDF");
    });

    it("Updates token URI", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);
      let txn = await soulGen.mintSoulGen(owner.address); 
      // Wait for it to be mined.
      await txn.wait();

      const newURI = "HELLO WORLD";
      await soulGen.updateTokenURI(0, newURI); 
      let uri = await soulGen.getURI(0);
      expect(uri).to.equal(newURI);
    });

    it("Can't update token that doesn't exist", async function () {
      const { soulGen, owner } = await loadFixture(deploySoulGenToken);
      let txn = await soulGen.mintSoulGen(owner.address); 
      // Wait for it to be mined.
      await txn.wait();
      
      const newURI = "HELLO WORLD";
      await expect(soulGen.updateTokenURI(10, newURI)).to.be.revertedWith(
        "Token does not exit!"
      );
    });
  });

  describe("Admin", function () {
    it("Owner can update owner", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateOwner(otherAccount.address);
      let newOwner = await soulGen.getOwner(); 
      expect(newOwner).to.equal(otherAccount.address);
    });

    it("Owner can update auctioneer", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateAuctioneer(otherAccount.address);
      let auctioneer = await soulGen.getAuctioneer(); 
      expect(auctioneer).to.equal(otherAccount.address);
    });

    it("Owner can update updater", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateUpdater(otherAccount.address);
      let Updater = await soulGen.getUpdater(); 
      expect(Updater).to.equal(otherAccount.address);
    });
    it("Non-owner can't update auctioneer", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateOwner(otherAccount.address);
      await expect(soulGen.updateAuctioneer(otherAccount.address)).to.revertedWith(
        "Only owner"
      );
    });
    it("Non-owner can't update updater", async function () {
      const { soulGen, owner, otherAccount } = await loadFixture(deploySoulGenToken);
      await soulGen.updateOwner(otherAccount.address);

      await expect(soulGen.updateUpdater(otherAccount.address)).to.revertedWith(
        "Only owner"
      );
    });
  });
});
