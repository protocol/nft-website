---
title: Mint NFTs on Avalanche 🚧
description: Learn how to start minting NFTs on Avalanche.
issueUrl: https://github.com/protocol/nft-website/issues/224
---

# Mint NFTs on Avalanche

This short tutorial will quickly guide you through getting started with an EVM-compatible NFT minting work flow on [Avalanche](https://www.avax.network/). This is also useful if you are migrating from Ethereum or other EVM-compatible blockchain and wish to reuse your smart contract code.

## Avalanche vs Ethereum

Avalanche is a network of multi-blockchains, one of which runs a fork of Ethereum Virtual Machine (EVM).

Avalanche consists of 3 subnets, X-chain, P-chain, and C-chain.

- **X-chain**: Deals with exchanges of value and runs AVM (namespaced `avm`)
- **P-chain**: Deals with platform/protocol (core) and able to create new arbitrary blockchains (namespaced `platform`)
- **C-chain**: the EVM-compatible chain capable of running Solidity smart contract / dapps

Most beginner's confusion will be from these different subnets. Note that only the C-chain is EVM-compatible and has Ethereum-compatible addresses. and most of dapps will be interacting with this chain.

![Avalanche's subnets](https://docs.avax.network/assets/images/image(21)-3c5cb7f1f21926b05ae3631f453ed49d.png)

## Setting up

The quickest way to start is to run a group of simulator nodes locally. To do that, follow these steps:

### Install and download

- [Install Go](https://go.dev/dl/). Make sure to set `$GOPATH` variable to where you keep Go code (i.e. `$HOME/go`).

- [Clone Avalanchego](https://github.com/ava-labs/avalanchego) (Avalanche node) and [Avalanch local simulator](https://github.com/ava-labs/ava-sim#readme). Make sure they are inside `$GOPATH/src/github.com/ava-labs`.

- Make sure you have [Node.js](https://nodejs.org/en/) on your system to create the NFT app.

### Run local simulator nodes

- Build both projects with `./scripts/build.sh` included in the downloaded repositories.

- In `ava-sim`, run the simulator with `./scripts/run.sh`, which relies on `avalanchego` being in the right place. The simulator runs a local network of 5 nodes listening on different ports. We will be using a node listening on port 9650.

### Create a keystore user and add test fund

Create a keystore user and store the credential on the target node (here, the node running on port 3650). Send a request to this API endpoint:

```shell
curl -X POST --data '{
    "jsonrpc":"2.0",
    "id"     :1,
    "method" :"keystore.createUser",
    "params" :{
        "username":"myUsername",
        "password":"myPassword"
    }
}' -H 'Content-Type: application/json' 127.0.0.1:9650/ext/keystore
```

**Don't forget to replace "myUsername" and "myPassword" with your own.**

> **Important**: You should only create a keystore user on a node that you operate, as the node operator has access to your plaintext password.

Note the pre-funded "ewoq" private key, which is a test private key for getting some test AVAX in your account.

```shell
PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN
```

Import the private key to a C-chain address:

```shell
curl --location --request POST '127.0.0.1:9650/ext/bc/C/avax' \
--header 'Content-Type: application/json' \
--data-raw '{
    "method": "avax.importKey",
    "params": {
        "username":"username",
        "password":"password",
        "privateKey":"PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"
    },
    "jsonrpc": "2.0",
    "id": 1
}'
```

Be thorough on the URL paths and the method namespace (again because of the subnets you might be running queries against the wrong one).

Read more: [Funding a Local Network](https://docs.avax.network/build/tutorials/platform/fund-a-local-test-network)

### Integrate with Metamask

Set up Metamask to connect to a custom RPC address of the local network:

#### Avalanche Mainnet Settings

Network Name: Avalanche Mainnet C-Chain
New RPC URL: https://api.avax.network/ext/bc/C/rpc
ChainID: 43114
Symbol: AVAX
Explorer: https://snowtrace.io/

#### FUJI Testnet Settings
Network Name: Avalanche FUJI C-Chain
New RPC URL: https://api.avax-test.network/ext/bc/C/rpc
ChainID: 43113
Symbol: AVAX
Explorer: https://testnet.snowtrace.io/

#### Local Testnet (Avalanche Local Simulator) Settings
Network Name: Avalanche Local
New RPC URL: http://localhost:9650/ext/bc/C/rpc
ChainID: 43112
Symbol: AVAX
Explorer: N/A

> **Local testnet**: Listening port might not be 9650 depending on if you run an example program in `avalanchego` node or `avalanche-simulator` run script. The latter is recommended for quick start and will have a listening node on port 9650.

Create a new Metamask account by importing this private key `0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027` on Metamask

![adding new account on metamask](https://docs.avax.network/assets/images/Metamask-Import-Account-17b4d3c6e167ebf8709ace5bc30001f6.png)

If all went well, you should have a funded Metamask AVAX wallet for building app locally:

![Metamask with AVAX funded](https://i.imgur.com/fkLXV17.png)

### Optional

- Clone [Avalanche smart contract quickstart](https://github.com/ava-labs/avalanche-smart-contract-quickstart). Install deps with `yarn`,

### Public API node

Avalanche maintains a [public API gateway](https://docs.avax.network/build/tools/public-api), which you can use in quick development without having to run your own node.

## Create an NFT app

With Node.js already installed, run `npm init` to create a new app project, then `cd` into your new directory and run the following:

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

If you had correctly [created a keystore user and added test fund](#create-a-keystore-user-and-add-test-fund), you should see one of wealthy addresses shown.


## Develop an NFT smart contract

If you already have an existing smart contract, you may skip this section.

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

    constructor() ERC721("Filet", "FIT") {}

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

You can come up with your own contract's name, token's name, and token's ticker. I'm naming mine `Filet` here.

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

Now, type the following into the prompt to instantialize the contract object:

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

Obviously `0x9632a79656af553F58738B0FB750320158495942` does not own any FIT token yet. Let's mint some and send to the address with:

```js
>> const tx = await filet.mintTo(accounts[1], "ipfs://bafkreigaymo3qz73w4nit2matfs7dugczda5wuwzq4g3o2chz4f6nugtaq/1.json")
>> const bal = (await filet.balanceOf(account[1])).toString()
>> bal
> '1'
```

The receiving address now owns 1 FIT. By the default `ethers` use the first address as the signer of the transaction, therefore it is `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC` signing off the minting.

Note the `ipfs://...` provided as the token metadata URI. `ERC721URIStorage` is a special implementation of the IERC721 interface with extra capability of setting and getting metadata URI for the token. This token URI will be retrieved by uploading the intial metadata to [nft.storage](https://nft.storage).

## Uploading NFT metadata

Before we can continue, install `nft.storage` and `mime` libraries with `npm install nft.storage mime --save`.

Now we will upload an NFT's metadata -- image, name, and description -- to nft.storage and use the IPFS URI in the `mintTo`. To write a script that can be imported and run on Hardhat Node REPL, create a file called `upload.mjs` inside the `/scripts` directory with the following code:

```js
import { NFTStorage, File } from 'nft.storage'

import mime from 'mime'

import fs from 'fs'

import path from 'path'

const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5YzIyMUUzOTFiNDMwMzQ4NDc2NzdmMmVGZTc1ODRGNTM2ZjM4OWEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NDU0MjMwNTQ1MSwibmFtZSI6IkF2YWxhbmNoZSJ9.koIFwWwDdhjcBZp2U8OHDiKsfPhXu5aHGXHBQfPVlno'

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
>> const tx = await filet.mintTo(accounts[2], result.url)
```

