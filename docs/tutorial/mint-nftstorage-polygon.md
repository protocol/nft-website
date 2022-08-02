---
title: Mint with NFT.storage and Polygon
description: Learn how to mint your NFT using NFT.storage and Polygon
---

# Mint with NFT.storage and Polygon

This tutorial will teach you to mint an NFT using the Polygon blockchain and IPFS/Filecoin storage via NFT.Storage. Polygon, a Layer 2 scaling solution for Ethereum, is often chosen by developers for its speed and lower transaction costs while maintaining full compatibility with Ethereum's EVM. The tutorial will walk you through the creation and deployment of a standardized smart contract, storing metadata and assets on IPFS and Filecoin via the NFT.Storage API and minting the NFT to your own wallet on Polygon.

## Introduction

In this tutorial, we will aim to fulfill three characteristics of our minting process:

1. *Scalability* of the minting process in terms of cost and throughput. If the use case aims to rapidly create NFTs, the underlying technology needs to handle all minting requests and the minting should be cheap.
2. *Durability* of the NFT, as assets can be long-lived and therefore need to remain usable during their full lifetime.
3. *Immutability* of the NFT and the asset it represents to prevent unwanted changes and malicious actors from changing the digital asset the NFT represents.

[Polygon](https://polygon.technology) addresses the *scalability* characteristic with their protocol and framework. They are also compatible with Ethereum and its virtual machine, enabling developers to move their code freely between the two blockchains. Likewise, [NFT.Storage](https://nft.storage) guarantees *durability* with the power of the underlying [Filecoin](https://filecoin.io) network and *immutability* by using IPFS' [content addressing](../../concepts/content-addressing/).

In this tutorial, you will get an overview of the NFT minting process, learn how to store a digital asset with NFT.Storage and use this digital asset to mint your NFT on Polygon.

## Prerequisites

General knowledge about NFTs will give you background and context. [NFT School covers NFT basics](../../concepts/non-fungible-tokens/), advanced topics and has more tutorials.

To test and run the code found in this tutorial, you will need a working [Node.js installation](https://nodejs.org/en/download/package-manager/). NPM version 8 and above is required.

You'll also need a Polygon wallet on the Mumbai testnet with a small amount of the MATIC token. Follow the instructions below to get started:

1. **Download and install [Metamask](https://metamask.io/)**. Metamask is a crypto wallet and gateway to blockchain apps. It's very easy to use and simplifies a lot of steps, e.g., setting up a Polygon wallet.
2. **Connect Metamask to Polygon's [Mumbai testnet](https://blog.pods.finance/guide-connecting-mumbai-testnet-to-your-metamask-87978071aca8)** and select it in the dropdown menu. We will use Polygon's testnet to mint our NFT as it's free of charge.
3. **Receive MATIC token** to your wallet by using the [faucet](https://faucet.polygon.technology/). Select the Mumbai testnet and paste your wallet address from Metamask into the form. To mint an NFT, we need to pay a small amount of MATIC, which is a fee charged by miners for operations to add new transactions to the blockchain, e.g., minting an NFT or creating a new smart contract.
4. **Copy your private key** from Metamask by clicking on the three dots in the top right corner and selecting 'Account details'. On the bottom, you can find a button to export your private key. Click it and enter your password when prompted. You can copy and paste the private key into a text file for now. We will use it later in the tutorial when interacting with the blockchain.

Lastly, you will need a text or code editor. For more convenience, choose an editor with language support for both JavaScript and Solidity. A good option is [Visual Studio Code](https://code.visualstudio.com) with the [solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) extension enabled.

## Preparation

### Get an API key for NFT.storage

To use NFT.Storage you need an API key. First, [head over to NFT.Storage to log in with your email address](https://nft.storage/login/). You will receive an email with a magic link that signs you in -- no password needed. After you successfully logged in, go to API Keys via the navigation bar. You will find a button to create a **New Key**. When prompted for an API key name, you can freely choose one or use “polygon + NFT.Storage”. You can copy the content of the key column now or reference it back to NFT.Storage later in the tutorial.

Keen to try the scripts quickly? Clone this sample code repo [here](https://github.com/jenks-guo-filecoin/nftschool.dev-demo).

### Set up your workspace

Create a new empty folder that we can use as our workspace for this tutorial. Feel free to choose any name and location on your file system. Open up a terminal and navigate to the newly created folder.

Next, we will install the following Node.js dependencies:

- **Hardhat and Hardhat-Ethers**, a development environment for Ethereum (and Ethereum compatible blockchains like Polygon).
- **OpenZeppelin**, a collection of smart contracts featuring standardized NFT base contracts.
- **NFT.Storage**, a library to connect to the NFT.Storage API.
- **Dotenv**, a library to handle environment files for configuration (e.g., injecting private keys into the script).

Use the following command to install all dependencies at once:

```bash
npm install hardhat @openzeppelin/contracts nft.storage dotenv @nomiclabs/hardhat-ethers
```

Hardhat needs to be initialized in the current folder. To start the initialization, execute:

```bash
npx hardhat
```

When prompted, choose `Create an empty hardhat.config.js`. Your console output should look like this:

```bash
✔ What do you want to do? · Create an empty hardhat.config.js
✨ Config file created ✨
```

We will do some modifications to the hardhat configuration file `hardhat.config.js` to support the Polygon Mumbai test network. Open the `hardhat.config.js` that was created in the last step. Please note that we are loading your Polygon wallet private key from an environment file and that this environment file must be kept safe.

```js
/**
* @type import('hardhat/config').HardhatUserConfig
*/
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const { PRIVATE_KEY } = process.env;
module.exports = {
  defaultNetwork: "PolygonMumbai",
  networks: {
    hardhat: {
    },
     PolygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}
```

Create a new file called `.env` which will hold your API key for NFT.Storage and your Polygon wallet. The content of the `.env` file should look like the listing below:

```bash
PRIVATE_KEY="Your private key"
NFT_STORAGE_API_KEY="Your api key"
```

Replace the placeholders with the API key you created during preparation and your Polygon wallet private key.

To keep our project organized, we'll create three new folders:

1. `contracts`, for the Polygon contracts written in Solidity.
2. `assets`, containing the digital asset we will mint as an NFT.
3. `scripts`, as helpers to drive the preparation and minting process.

Execute the following command:

```bash
mkdir contracts assets scripts
```

Lastly, we will add an image to the `assets` folder. This image will be the artwork that we will upload to NFT.Storage and mint on Polygon. We will name it `MyExampleNFT.png` for now. If you do not have some nice art ready, you can [download a simple pattern](https://ipfs.io/ipfs/bafkreiawxb4aji744637trok275odl33ioiijsvvahnat2kw5va3at45mu).

## Minting your NFT

### Storing asset data with NFT.Storage

We will use NFT.Storage to store our digital asset and its metadata. NFT.Storage guarantees immutability and durability by uploading your digital asset to Filecoin and IPFS automatically. IPFS and Filecoin operate on content identifiers (CID) for immutable referencing. IPFS will provide fast retrieval with its geo-replicated caching and Filecoin guarantees durability with incentivized storage providers.

Create a script called `store-asset.mjs` below the `scripts` directory. The contents are listed below:

```js
import { NFTStorage, File } from "nft.storage"
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.NFT_STORAGE_API_KEY

async function storeAsset() {
   const client = new NFTStorage({ token: API_KEY })
   const metadata = await client.store({
       name: 'ExampleNFT',
       description: 'My ExampleNFT is an awesome artwork!',
       image: new File(
           [await fs.promises.readFile('assets/MyExampleNFT.png')],
           'MyExampleNFT.png',
           { type: 'image/png' }
       ),
   })
   console.log("Metadata stored on Filecoin and IPFS with URL:", metadata.url)
}

storeAsset()
   .then(() => process.exit(0))
   .catch((error) => {
       console.error(error);
       process.exit(1);
   });
```

The main part of the script is the `storeAsset` function. It creates a new client connecting to NFT.Storage using the API key you created earlier. Next we introduce the metadata consisting of the name, description, and image. Note that we are reading the NFT asset directly from the file system from the `assets` directory. At the end of the function, we will print the metadata URL as we will use it later when creating the NFT on Polygon.

After setting up the script, you can execute it by running:

```bash
node scripts/store-asset.mjs
```

Your output should look like the listing below, where `HASH` is the CID to the art you just stored.

```bash
Metadata stored on Filecoin/IPFS at URL: ipfs://HASH/metadata.json
```

### Creating your NFT on Polygon

#### Create the smart contract for minting

First, we will create a smart contract that will be used to mint the NFT. Since Polygon is compatible with Ethereum, we will write the smart contract in [Solidity](https://soliditylang.org). Create a new file for our NFT smart contract called `ExampleNFT.sol` inside the `contracts` directory. You can copy the code of the listing below:

```solidity
// Contract based on https://docs.openzeppelin.com/contracts/4.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExampleNFT is ERC721URIStorage, Ownable {
   using Counters for Counters.Counter;
   Counters.Counter private _tokenIds;

   constructor() ERC721("NFT", "ENFT") {}

   function mintNFT(address recipient, string memory tokenURI)
       public onlyOwner
       returns (uint256)
   {
       _tokenIds.increment();

       uint256 newItemId = _tokenIds.current();
       _mint(recipient, newItemId);
       _setTokenURI(newItemId, tokenURI);

       return newItemId;
   }
}
```

To be a valid NFT, your smart contract must implement all the methods of the [ERC-721 standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/). We use the implementation of the [OpenZeppelin](https://openzeppelin.com) library, which already provides a set of basic functionalities and adheres to the standard.

At the top of our smart contract, we import three OpenZeppelin smart contract classes:

`\@openzeppelin/contracts/token/ERC721/ERC721.sol` contains the implementation of the basic methods of the ERC-721 standard, which our NFT smart contract will inherit. We use the `ERC721URIStorage,` which is an extension to store not just the assets but also metadata as a JSON file off-chain. Like the contract, this JSON file needs to adhere to ERC-721.

`\@openzeppelin/contracts/utils/Counters.sol` provides counters that can only be incremented or decremented by one. Our smart contract uses a counter to keep track of the total number of NFTs minted and to set the unique ID on our new NFT.

`\@openzeppelin/contracts/access/Ownable.sol` sets up access control on our smart contract, so only the owner of the smart contract (you) can mint NFTs.

After our import statements, we have our custom NFT smart contract, which contains a counter, a constructor, and a method to actually mint the NFT. Most of the hard work is done by the base contract inherited from OpenZeppelin, which implements most of the methods we require to create an NFT adhering to the ERC-721 standard.

The counter keeps track of the total number of NFTs minted, which is used in the minting method as a unique identifier for the NFT.

In the constructor, we pass in two string arguments for the name of the smart contract and the symbol (represented in wallets). You can change them to whatever you like.

Finally, we have our method `mintNFT` that allows us to actually mint the NFT. The method is set to `onlyOwner` to make sure it can only be executed by the owner of the smart contract.

`address recipient` specifies the address that will receive the NFT at first

`string memory tokenURI` is a URL that should resolve to a JSON document that describes the NFT's metadata. In our case it's already stored on NFT.Storage. We can use the returned IPFS link to the metadata JSON file during the execution of the method.

Inside the method, we increment the counter to receive a new unique identifier for our NFT. Then we call the methods provided by the base contract from OpenZeppelin to mint the NFT to the recipient with the newly created identifier and set the URI of the metadata. The method returns the unique identifier after execution.

#### Deploy the smart contract to Polygon

Now, it's time to deploy our smart contract to Polygon. Create a new file called `deploy-contract.mjs` within the `scripts` directory. Copy the contents of the listing below into that file and save it.

```js
async function deployContract() {
 const ExampleNFT = await ethers.getContractFactory("ExampleNFT")
 const exampleNFT = await ExampleNFT.deploy()
 await exampleNFT.deployed()
 // This solves the bug in Mumbai network where the contract address is not the real one
 const txHash = exampleNFT.deployTransaction.hash
 const txReceipt = await ethers.provider.waitForTransaction(txHash)
 const contractAddress = txReceipt.contractAddress
 console.log("Contract deployed to address:", contractAddress)
}

deployContract()
 .then(() => process.exit(0))
 .catch((error) => {
   console.error(error);
   process.exit(1);
 });
```

Deploying the contract is done with the helper functions provided by the hardhat library. First, we get the smart contract we created in the previous step with the provided factory. Then we deploy it by calling the respective method and waiting for the deployment to be completed. There are a few more lines below the described code to get the correct address in the testnet environment. Save the `mjs` file Execute the script with the following command:

```bash
npx hardhat run scripts/deploy-contract.mjs --network PolygonMumbai
```

If everything is correct, you will see the following output:

```bash
Contract deployed to address: 0x{YOUR_CONTRACT_ADDRESS}
```

Note that you will need the printed contract address in the minting step. You can copy and paste it into a separate text file and save it for later. This is necessary so the minting script can call the minting method of that specific contract.

#### Minting the NFT on Polygon

Minting the NFT is now merely calling the contract we just deployed to Polygon. Create a new file called `mint-nft.mjs` inside the `scripts` directory and copy this code from the listing below:


```js
const CONTRACT_ADDRESS = "0x00xxx"
const META_DATA_URL = "ipfs://XXX/metadata.json"

async function mintNFT(contractAddress, metaDataURL) {
   const ExampleNFT = await ethers.getContractFactory("ExampleNFT")
   const [owner] = await ethers.getSigners()
   await ExampleNFT.attach(contractAddress).mintNFT(owner.address, metaDataURL)
   console.log("NFT minted to: ", owner.address)
}

mintNFT(CONTRACT_ADDRESS, META_DATA_URL)
   .then(() => process.exit(0))
   .catch((error) => {
       console.error(error);
       process.exit(1);
   });
```

Edit the first two lines to insert your **contract address** from the earlier deployment and the **metadata URL** that was returned when storing the asset with NFT.Storage. The rest of the script sets up the call to your smart contract with you as the to-be owner of the NFT and the pointer to the metadata stored on IPFS.

Next, run the script:

```bash
npx hardhat run scripts/mint-nft.mjs --network PolygonMumbai
```

You can expect to see the following output:

```bash
NFT minted to: 0x{YOUR_WALLET_ADDRESS}
````

#### Verify your NFT

To verify your NFT, first go to Metamask test account. If minting was successful, your MATIC balance should reduce.

To visually confirm your NFT, visit [Opensea Testnets](https://testnets.opensea.io/account), connect your Metamask test account, authorize. Then you should see your freshly minted NFT displayed under your account.

## Conclusion

In this tutorial, we learned how to mint an NFT end-to-end with Polygon and NFT.Storage. This technology combination results in proper decentralization and guarantees *scalability*, *durability*, and *immutability*.

We deployed a custom smart contract to mint our NFT specific to our needs. For this tutorial, we used a simple example based on the ERC-721 standard. However, you can also define complex logic that governs your NFT life cycle. For more complex use cases, the successor standard [ERC-1155](https://ethereum.org/en/developers/docs/standards/tokens/erc-1155/) is a good place to start. OpenZeppelin, the library we use in our tutorial offers a [contracts wizard](https://docs.openzeppelin.com/contracts/4.x/wizard) that helps create NFT contracts.

Successful minting can be seen as the start of the valuable phase of the NFT. The NFT can then be used to prove ownership and can be transferred to other users. Reasons to transfer an NFT might include a successful sale on one of the NFT marketplaces like [OpenSea](https://opensea.io), or a different type of event such as acquiring an item in an NFT based game. Exploring the rich possibilities for NFTs is definitely an exciting next step.

If you\'d like help building your NFT project with NFT.storage, we encourage you to join the `#nft-storage` channel on [Discord](https://discord.gg/Z4H6tdECb9) and [Slack](https://filecoin.io/slack).
