// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory('SoulGen');
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);

  // Call the function.
  let txn = await nftContract.mintSoulGen()
  // Wait for it to be mined.
  await txn.wait()

  let uri = await nftContract.getURI(0); 
  console.log(uri); 

  txn = await nftContract.updateTokenURI(0, "https://www.jsonkeeper.com/b/RUUS"); 
  txn.wait();

  uri = await nftContract.getURI(0); 
  console.log(uri);

  let royalty = await nftContract.royaltyInfo(0, 1000);
  console.log("Royalty: " + royalty);

};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();