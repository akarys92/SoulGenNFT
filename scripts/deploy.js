

const RESERVE_PRICE = hre.ethers.utils.parseEther("0.001"); 
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; 
const AUCTION_LENGTH_FAST = 60;

const main = async () => {
    // Deploy the auctioneer
    console.log("Deplooying Auctioneer..."); 
    const AuctioneerFactory = await hre.ethers.getContractFactory('Auctioneer');
    const auctioneerContract = await AuctioneerFactory.deploy(); 
    await auctioneerContract.deployed(); 
    console.log("Auctioneer deployed to: " + auctioneerContract.address); 

    // Deploy the token
    console.log("Deploying token..."); 
    const nftContractFactory = await hre.ethers.getContractFactory('SoulGen');
    const nftContract = await nftContractFactory.deploy(auctioneerContract.address, "0x763F31c28f2cc0a753E22c449d28b5EcBB6D3E7a");
    await nftContract.deployed();
    console.log("Token deployed to: " + nftContract.address); 
    // Initialize the first auction
    console.log("Initializing auction..."); 
    await auctioneerContract.initialize(nftContract.address, RESERVE_PRICE, WETH_ADDRESS, AUCTION_LENGTH_FAST, AUCTION_LENGTH_FAST);
    const auction = await auctioneerContract.getAuction(); 
    console.log("Auction initiated...");
    console.log(auction); 

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