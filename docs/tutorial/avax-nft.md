---
title: Mint NFTs on Avalanche 🚧
description: Learn how to start minting NFTs on Avalanche.
issueUrl: https://github.com/protocol/nft-website/issues/224
---

# Mint NFTs on Avalanche

This tutorial will guide you through getting started with an EVM-compatible NFT minting work flow on [Avalanche](https://www.avax.network/) using [Node.js REPL](https://nodejs.dev/learn/how-to-use-the-nodejs-repl). This is quite useful if you are migrating from Ethereum or other EVM-compatible blockchain and wish to reuse your code.

## Avalanche vs Ethereum

Unlike Ethereum, Avalanche is a network of multi-blockchains, one of which runs a fork of the Ethereum Virtual Machine (EVM) and is compatible with Ethereum.

Avalanche consists of 3 subnets: The X-chain, P-chain, and C-chain.

- **X-chain**: Deals with exchanges of value and runs the [Avalanche Virtual Machine](https://docs.avax.network/build/references/cryptographic-primitives/#cryptography-in-the-avalanche-virtual-machine) (namespaced `avm`)
- **P-chain**: Deals with platform/protocol (core) and is able to create new arbitrary blockchains (namespaced `platform`)
- **C-chain**: the EVM-compatible chain capable of running Solidity smart contracts and dapps. It has Ethereum-compatible addresses (hexadecimal strings prefixed with "0x" concatenated with the rightmost 20 bytes of the Keccak-256 hash ECDSA public key)

Most confusion happens for beginners when trying to distinguish between these different subnets. It's important to note that only the C-chain has EVM-compatibility and Ethereum-compatible addresses. The majority of dapps will be interacting with this chain.

![Avalanche's diagram of subnets](https://docs.avax.network/assets/images/image(21)-3c5cb7f1f21926b05ae3631f453ed49d.png)

Now that we have learned about Avalanche's infrastructure, let's gear up to build!

## Setting up

The quickest way to start is to run a group of simulator nodes locally. To do that, follow these steps:

### Install and download

- [Install Go](https://go.dev/dl/). Make sure to set the `$GOPATH` variable to where you keep Go code (i.e. `$HOME/go`).

- [Clone Avalanchego](https://github.com/ava-labs/avalanchego) (Avalanche node) and [Avalanch local simulator](https://github.com/ava-labs/ava-sim#readme). Make sure they are inside `$GOPATH/src/github.com/ava-labs`.

- Make sure you have Node.js on your system by downloading it from the [Node.js page](https://node.js.org/en/). We'll need this to create the NFT.

### Run local simulator nodes

- Build both projects with `./scripts/build.sh` included in the downloaded repositories.

- In `ava-sim`, run the simulator with `./scripts/run.sh`, which relies on `avalanchego` being in the right place. The simulator runs a local network of 5 nodes listening on different ports. We will be using a node listening on port 9650.

### Create a keystore user and add test fund

In order to get some test fund in AVAX, we have to create a keystore user using a username and password on the target node (here, it's the node running on port 3650). With your own username and password, send a request to this endpoint:

```shell
curl -X POST --data '{
    "jsonrpc":"2.0",
    "id"     :1,
    "method" :"keystore.createUser",
    "params" :{
        "username":"MYUSERNAME",
        "password":"MYPASSWORD"
    }
}' -H 'Content-Type: application/json' 127.0.0.1:9650/ext/keystore
```

Replace `MYUSERNAME` and `MYPASSWORD` with your own username and password, respectively.

> **Important**: You should only create a keystore user on a node that you operate, as the node operator can access your plaintext password.

Note the following pre-funded private key (called the "ewoq" key in Avalanche doc), which is a provided private key for getting your local account funded convenient. We will import this private key to a C-chain address:

```shell
PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN
```

```shell
curl --location --request POST '127.0.0.1:9650/ext/bc/C/avax' \
--header 'Content-Type: application/json' \
--data-raw '{
    "method": "avax.importKey",
    "params": {
        "username":"MYUSERNAME",
        "password":"MYPASSWORD",
        "privateKey":"PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"
    },
    "jsonrpc": "2.0",
    "id": 1
}'
```

Read more: [Funding a Local Network](https://docs.avax.network/build/tutorials/platform/fund-a-local-test-network)

### Integrate with Metamask

Set up Metamask to connect to a custom RPC address of the local network:

#### Local Testnet (Avalanche Local Simulator) Settings
Network Name: Avalanche Local
New RPC URL: http://localhost:9650/ext/bc/C/rpc
ChainID: 43112
Symbol: AVAX
Explorer: N/A

You can check out settings for the testnet and mainnet [here](https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask/#avalanche-mainnet-settings).

> **Local testnet**: Listening port might not be 9650 depending on if you run an example program in `avalanchego` node or `avalanche-simulator` run script. The latter is recommended for quick start and will have a listening node on port 9650.

Create a new Metamask account by importing this provided private key `0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027` on Metamask, which is a test account for local test only.

![adding new account on metamask](https://docs.avax.network/assets/images/Metamask-Import-Account-17b4d3c6e167ebf8709ace5bc30001f6.png)

If all went well, you should have a funded Metamask AVAX wallet for building app locally:

![Metamask with AVAX funded](https://i.imgur.com/fkLXV17.png)

### Public API node

Avalanche maintains a [public API gateway](https://docs.avax.network/build/tools/public-api), which you can use in quick development without having to run your own node.

## Create a Node project

With Node.js already installed, type the following on the command line to create a project directory:

```shell
mkdir hello-avax && cd hello-avax
npm init --yes
```

Then in `hello-avax` directory, install some packages with:

```shell
npm install hardhat ethers @nomiclabs/hardhat-ethers --save-dev
```

Then, you can check if the installation was successful by typing `npx hardhat --version`. The Hard Hat CLI should print out the version number (yours may be different):

```shell
npx hardhat --version
> 2.6.1
```

Now, with the local simulator nodes still running, run the following commands:

```shell
npx hardhat accounts --network local
> 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
> 0x9632a79656af553F58738B0FB750320158495942
> 0x55ee05dF718f1a5C1441e76190EB1a19eE2C9430
> ...
```

Hopefully you should see a few addresses printed. Next, check the balances with:

```shell
npx hardhat balances --network local
> 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC has balance 50000000000000000000000000
> 0x9632a79656af553F58738B0FB750320158495942 has balance 0
> 0x55ee05dF718f1a5C1441e76190EB1a19eE2C9430 has balance 0
> ...
```

If you have correctly [created a keystore user and added test fund](#create-a-keystore-user-and-add-test-fund), you should see one of wealthy addresses pictured above.

## Develop an NFT smart contract

If you already have an existing EVM-compatible smart contract for minting NFTs, you may want to skip this section.

We will create [ERC721](https://eips.ethereum.org/EIPS/eip-721) non-fungible tokens with their own attributes. To keep this simple, any account will be able to call a method `mintTo` to mint items.

We will be using the standard [ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721) smart contract from Open Zeppelin. Install it in your project with `npm install @openzeppelin/contract`.

Create a directory named `/contracts` within the project root. Create a smart contract file named `Filet.sol` with the following code:

```js
// contracts/Filet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Filet is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Filet", "FILET") {}

    function mintTo(address player, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}

```

You can come up with your own contract name, token name, and token symbol instead of "Filet".

Now compile the contract `Filet.sol` using this hardhat command:

```shell
npx hardhat compile
> Compiling 1 file with 0.8.0
> Compilation finished successfully
```

Once the contract is compiled, create another directory named `script` and add `deploy.js` with the following code:

```js
import {
  Contract,
  ContractFactory
} from "ethers"
import { ethers } from "hardhat"

const deploy = async (contractName) => {
  const Contract = await ethers.getContractFactory(contractName)
  const contract = await Contract.deploy()

  await contract.deployed()
  console.log(`${contractName} deployed to: ${contract.address}`)
}

const main = async () => {
  await deploy("Filet")
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
```

This script uses [Ethers](https://docs.ethers.io/v5/) library to deploy the contract to the local Avalanche node(s). Now, deploy the contract with:

```shell
npx hardhat run scripts/deploy.js --network local
> Filet deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

We now have a token contrat deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`.

Note that up until now, the steps are the same for both Ethereum and Avalanche.

Now let's spin up Hardhat's [developer console](https://hardhat.org/guides/hardhat-console.html) to start interacting with our `Filet` contract:

```shell
npx hardhat console --network local
> Welcome to Node.js v14.18.1.
> Type ".help" for more information.
> >
```

Now, type the following into the prompt to initialize the contract object:

```js
>> const Filet = await ethers.getContractFactory("Filet")
>> const filet = await Filet.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
```

Next, we inspect the accounts and the balances:

```js
>> const accounts = await ethers.provider.listAccounts()
>> accounts
> [
>   '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC',
>   '0x9632a79656af553F58738B0FB750320158495942',
>   '0x55ee05dF718f1a5C1441e76190EB1a19eE2C9430',
>   // ...
> ]
```

The array, unsurprisingly, should contain all the addresses listed with the previous `npx hardhat accounts` command. Select one of the addresses to inspect the balance (In this case, we are choosing the second account listed)

```js
>> const balance = (await filet.balanceOf(accounts[1])).toString()
> 0
```

Obviously the address `0x9632a79656af553F58738B0FB750320158495942` belonging to the second account we accessed with `accounts[1]` does not own any FILET token. Let's mint one to the address with:

```js
>> const tokenId = await filet.callStatic.mintTo(accounts[1], "ipfs://bafkreigaymo3qz73w4nit2matfs7dugczda5wuwzq4g3o2chz4f6nugtaq/metadata.json")
>> tokenId.toString()
> '1'
>> const bal = (await filet.balanceOf(account[1])).toString()
>> bal
> '1'
```

>> 💡 **Why calling `callStatic`?**
>> The return value of a non-pure or -view Solidity function is available only when the function is called on-chain (from the same contract or another contract).  
>> When such function is called off-chain (i.e. from ethers.js as we are), the return value is the hash of that transaction. If we called `mintTo` directly, we would receive in return the transaction object, not the token ID we expect from the actual `mintTo` method in the contract.  
>> To learn more, read [View and Pure Functions](https://solidity-by-example.org/view-and-pure-functions/), this [Stack Exchange post](https://ethereum.stackexchange.com/questions/88119/i-see-no-way-to-obtain-the-return-value-of-a-non-view-function-ethers-js), and [ethers.js doc for `callStatic`](https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract/-%23-contract-callStatic).

The receiving address now owns 1 FIT. By default `ethers` uses the first address as the signer of the transaction, therefore it is `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC` signing off on the minting.

Note the `ipfs://...` provided as the token metadata URI. [`ERC721URIStorage`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage) is a special implementation of the IERC721 interface with extra capabilities of setting and getting metadata URI for each token. This token URI will be retrieved by uploading the intial metadata to [nft.storage](https://nft.storage).

## Uploading NFT metadata

Before we can continue, install `nft.storage` and `mime` libraries at the project's root level with `npm install nft.storage mime --save`.

Now we will upload an NFT's metadata -- image, name, and description -- to nft.storage and use the resulting IPFS URI in the `mintTo`. To write a script that can be imported and run on Hardhat Node REPL, create a file called `upload.mjs` inside the `/scripts` directory with the following code (replacing `NFT_STORAGE_KEY` variable with **your own API key**).

```js
import { NFTStorage, File } from 'nft.storage'

import mime from 'mime'

import fs from 'fs'

import path from 'path'

const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5YzIyMUUzOTFiNDMwMzQ4NDc2NzdmMmVGZTc1ODRGNTM2ZjM4OWEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTN0NDU0MjMwNTQ1MSwibmFtZSI6IkF2YWxhbmNoZSJ9.koIFwWwDdhjcBZp2U8OHCiKsfPhXu5aHGXHBQfPXlno'

async function storeNFT(imagePath, name, description) {
    const image = await fileFromPath(imagePath)

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    return nftstorage.store({
        image,
        name,
        description,
    })
}

async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}

async function upload(imagePath, name, description) {
    const result = await storeNFT(imagePath, name, description)
    return result
}

export { upload }
```

Return to the Node REPL and import the `upload` function from the script. Copy an image file of your choice into the root directory to use as the NFT image.

```js
>> const { upload } = await import("./scripts/upload.mjs")
>> const result = await upload("./pickleheart.png", "Pickleheart", "Image of Pickleheart Filet")
>> result
> Token {
>   ipnft: 'bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue',
>   url: 'ipfs://bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue/metadata.json'
> }
```

Then we can use this new URI in minting:

```js
>> const tokenId = await filet.callStatic.mintTo(accounts[3], result.url)
>> tokenId.toNumber()
> 2
```

## Retrieving a token's metadata

The final step here is to retrieve the metadata URI for each token from nft.storage so you can display its image, name, and description, which we can do so using [ERC721URIStorage.tokenURI(uint256 tokenId)](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol#L20).

```js
>> let ipfsURI = await filet.tokenURI(tokenId.toNumber())
>> ipfsURI
> 'ipfs://bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue/metadata.json'
```

To convert this IPFS URI into an HTTPS version so it's easy to use in HTML or fetch API, you can import a helper function `toGatewayURL` from nft.storage:

```js
>> const { toGatewayURL } = await import("nft.storage")
>> const { href } = await toGatewayURL(ipfsURI)
>> href
> 'https://nftstorage.link/ipfs/bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue/metadata.json'
```

🎉  Congratulations! You have learned to build an NFT store on Avalanche. Now go on and take on the world!
