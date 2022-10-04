import { Wallet } from "ethers";
import { Contract, ethers, ContractInterface } from "ethers";
import soulGenABI from "../../artifacts/SoulGen.json"

export class TokenConnector {
    private provider: ethers.providers.BaseProvider; 
    private tokenContract: Contract; 
    private wallet: Wallet; 

    constructor() {
        try {
            // Connect to blockchain
            this.provider = ethers.getDefaultProvider(process.env.NETWORK_RPC); 
            this.wallet = new Wallet(process.env.UPDATER_KEY, this.provider); 
            // Load contract
            this.tokenContract = new Contract(process.env.tokenAddress, soulGenABI, this.wallet); 
        }
        catch(e) {
            console.log("Error connecting to token contract"); 
            console.error(e); 
        }
        console.log("Connected.")
    }

    // Get the latest token that has been updated
    async getLastUpdated(): Promise<Number> {
        return this.tokenContract.getLastUpdated(); 
    }
    
    // Get the total number of total tokens
    async getTotalSupply(): Promise<Number> {
        return this.tokenContract.totalSupply(); 
    }
    // Update the token URI
    async updateTokenURI(tokenId: Number, URI: String): Promise<any> {
        return this.tokenContract.updateTokenURI(tokenId, URI); 
    }
}