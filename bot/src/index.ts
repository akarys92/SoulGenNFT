import * as dotenv from 'dotenv'; 
import { DalleConnector } from './Image';
dotenv.config(); 

async function main() {
    console.log(process.env.TEST)
    const d = new DalleConnector(); 
    let response = await d.generateImage("a large swan swimming on koolaid"); 
    console.log(response); 
    // Get non-updated tokens
    
    // For each non-updated token
    //      Generate a lookup string
    //      Get an image for the lookup string
    //      Save the image to IPFS
    //      Update the metadata on chain
}

main(); 