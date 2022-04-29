---
title: Mint ERC721 NFTs on Avalanche
description: Learn how to mint ERC721 tokens on Avalanche.
issueUrl: https://github.com/protocol/nft-website/issues/224
---

# Mint ERC721 NFTs on Avalanche

This tutorial will guide you through getting started with an EVM-compatible ERC721 tokens minting work flow on [Avalanche](https://www.avax.network/) using Node.js REPL.

Here is an overview of what we're going to learn:

- [Avalanche vs Ethereum](#avalanche-vs-ethereum)
- [Setting up local Avalanche nodes](#setting-up)
- [Funding a test account with AVAX](#create-a-keystore-user-and-add-test-fund)
- [Minting Avalanche ERC-721 tokens](#create-a-node-project)

You'll find this quite useful if you are migrating from Ethereum or other EVM-compatible blockchain and wish to reuse your NFT smart contract.

## Requirements

This tutorial assumes you have some familiarity with Javascript, Unix terminal, and Solidity.

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

- [Clone Avalanchego](https://github.com/ava-labs/avalanchego) (Avalanche node) and [Avalanche local simulator](https://github.com/ava-labs/ava-sim#readme). Make sure they are under `$GOPATH/src/github.com/ava-labs` for the [next step](#run-local-simulator-nodes) to work. For example, if my `$GOPATH` is currently set to `~/mycode/go`, `avalanchego` and `ava-sim` should be located at `~/mycode/go/src/github.com/ava-labs/avalanchego` and `~/mycode/go/src/github.com/ava-labs/ava-sim`, respectively.

- Make sure you have Node.js on your system by downloading it from the [Node.js page](https://node.js.org/en/). We'll need this to create the NFT.

### Run local simulator nodes

In order to interact with the blockchain locally, we'll have to run some nodes locally. Avalanche provides a simple way of doing this with a simulator script that runs 5 nodes on your local machine.

First, build the `avalanchego` and `ava-sim` programs in the downloaded repositories. They are Go projects that need to be compiled to executable programs. Both projects include a handy shell script that automatically builds the project located within its root directory at `/scripts/build.sh` as shown below (you can find the build script in the same location under `ava-sim`):

```shell
avalancego/
├── ...
└──scripts
   ├── ansible
   ├── aws
   ├── build.sh
   ├── ...
   └── versions.sh
```

Build each Go repository by executing the included shell script within each repository by typing `./scripts/build.sh` in your terminal at the root level. The first `.` is Unix's way of executing an executable. If you get an error from your shell mentioning denied permission, type `chmod +x scripts/build.sh` to turn the script into an executable.

Next, change into the `ava-sim` repository, run the simulator with `./scripts/run.sh`. This script runs the executables in `avalanchego`, so make sure it is in the `$GOPATH` sitting next to `ava-sim`. The simulator runs a local network of 5 nodes listening on different ports. **We will be using the one listening on port 9650 in this tutorial**.

If the simulator ran successfully, you should see it print to the stdout similar to the one shown below:

```shell
...

INFO [04-06|13:45:41] node/node.go#1051: node version is: avalanche/1.7.1
INFO [04-06|13:45:41] node/node.go#1052: node ID is: NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5
INFO [04-06|13:45:41] node/node.go#1053: current database version: v1.4.5
INFO [04-06|13:45:41] node/node.go#1051: node version is: avalanche/1.7.1
INFO [04-06|13:45:41] node/node.go#1052: node ID is: NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg
INFO [04-06|13:45:41] node/node.go#1053: current database version: v1.4.5
INFO [04-06|13:45:41] node/node.go#489: initializing API server
INFO [04-06|13:45:41] node/node.go#489: initializing API server
INFO [04-06|13:45:41] api/server/server.go#82: API created with allowed origins: [*]
INFO [04-06|13:45:41] api/server/server.go#82: API created with allowed origins: [*]

...
```

The simulator runs as a foreground process, so please open a new terminal to continue.

Well done! You're running Avalanche nodes consisting of all subnets on your local machine. 

### Create a keystore user and add test funds

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

Note the following pre-funded private key (called the "ewoq" key in Avalanche doc), which is a provided private key for getting your local account funded conveniently. We will import this private key to a C-chain address:

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

Note the `C` in the route URI indicating the chain we wanted to interact with? We only care about the C-chain because we are minting an ERC721 NFT. However, in the future you can and will be working with other chains by using the [public API](https://docs.avax.network/build/tools/public-api).

Read more: [Funding a Local Network](https://docs.avax.network/build/tutorials/platform/fund-a-local-test-network)

### Integrate with Metamask

Set up Metamask to connect to a custom RPC address of the local network:

#### Local Testnet (Avalanche Local Simulator) Settings
Network Name: Avalanche Local
New RPC URL: http://localhost:9650/ext/bc/C/rpc (for C-chain)
ChainID: 43112
Symbol: AVAX
Explorer: N/A

You can check out settings for the testnet and mainnet [here](https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask/#avalanche-mainnet-settings).

> **Local testnet**: Listening port might not be 9650 depending on if you run an example program in `avalanchego` node or `avalanche-simulator` run script. The latter is recommended for quick start and will have a listening node on port 9650.

Create a new Metamask account by importing this provided private key `0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027` on Metamask, which is a test account for local test only.

![adding new account on metamask](https://docs.avax.network/assets/images/Metamask-Import-Account-17b4d3c6e167ebf8709ace5bc30001f6.png)

If all went well, you should have a funded Metamask AVAX wallet for building your app locally:

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
npm install --save-dev hardhat
```

Then type `npx hardhat` in the root directory. The Hard Hat CLI should print out a few options to set up the project:

```shell
npx hardhat

> 888    888                      888 888               888
> 888    888                      888 888               888
> 888    888                      888 888               888
> 8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
> 888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
> 888    888 .d888888 888    888  888 888  888 .d888888 888
> 888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
> 888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888
>
> 👷 Welcome to Hardhat v2.9.3 👷‍
>
> ? What do you want to do? …
> ❯ Create a basic sample project
>   Create an advanced sample project
>   Create an advanced sample project that uses TypeScript
>   Create an empty hardhat.config.js
>   Quit
```

Select the first option "Create a basic sample project" and choose "Y" for all questions. Hardhat will install all the necessary dependencies and create some directories for you, such as `/contracts` and `/scripts`.

Next, copy this configuration and paste it in `hardhat.config.js` at the root level and save it:

```js
// hardhat.config.js
import { task } from "hardhat/config"
import { BigNumber } from "ethers"
import "@nomiclabs/hardhat-waffle"

const FORK_FUJI = false
const FORK_MAINNET = false
const forkingData = FORK_FUJI ? {
  url: 'https://api.avax-test.network/ext/bc/C/rpc',
} : FORK_MAINNET ? {
  url: 'https://api.avax.network/ext/bc/C/rpc'
} : undefined

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners()
  accounts.forEach((account) => {
    console.log(account.address)
  })
})

task("balances", "Prints the list of AVAX account balances", async (args, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts){
    const balance = await hre.ethers.provider.getBalance(
      account.address
    );
    console.log(`${account.address} has balance ${balance.toString()}`);
  }
})

export default {
  solidity: {
    compilers: [
      {
        version: "0.5.16"
      },
      {
        version: "0.6.2"
      },
      {
        version: "0.6.4"
      },
      {
        version: "0.7.0"
      },
      {
        version: "0.8.0"
      },
      {
        version: "0.8.1"
      }
    ]
  },
  networks: {
    hardhat: {
      gasPrice: 225000000000,
      chainId: !forkingData ? 43112 : undefined,
    },
    local: {
      url: 'http://localhost:9650/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43112,
      accounts: [
        "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027",
        "0x7b4198529994b0dc604278c99d153cfd069d594753d471171a1d102a10438e07",
        "0x15614556be13730e9e8d6eacc1603143e7b96987429df8726384c2ec4502ef6e",
        "0x31b571bf6894a248831ff937bb49f7754509fe93bbd2517c9c73c4144c0e97dc",
        "0x6934bef917e01692b789da754a0eae31a8536eb465e7bff752ea291dad88c675",
        "0xe700bdbdbc279b808b1ec45f8c2370e4616d3a02c336e68d85d4668e08f53cff",
        "0xbbc2865b76ba28016bc2255c7504d000e046ae01934b04c694592a6276988630",
        "0xcdbfd34f687ced8c6968854f8a99ae47712c4f4183b78dcc4a903d1bfe8cbf60",
        "0x86f78c5416151fe3546dece84fda4b4b1e36089f2dbc48496faf3a950f16157c",
        "0x750839e9dbbd2a0910efe40f50b2f3b2f2f59f5580bb4b83bd8c1201cf9a010a"
      ]
    }
  }
}
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

If you already have an existing EVM-compatible smart contract for minting NFTs, you may want to skip this section. However, it is pretty fun to follow along!

We will create [ERC721](https://eips.ethereum.org/EIPS/eip-721) non-fungible tokens with their own attributes. To keep this simple, any account will be able to call a method `mintTo` to mint items.

We will be using the standard [ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721) smart contract from Open Zeppelin. Install it in your project with `npm install @openzeppelin/contracts`.

In the `/contracts` directory, remove the generated file `Greeter.sol` and create a new file named `Filet.sol` and type the following code down (optionally you can copy and paste it, but you will miss [flexing your programming muscle](https://i.imgur.com/fawRchq.jpeg)):

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

Since we're implementing [`ERC721URIStorage`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage) for our NFT contract, we get the special method `_setTokenURI(tokenId, tokenURI)` for free on top of the regular `ERC721` interface. `ERC721URIStorage` is an extension of the IERC721 interface with a convenient capability of setting and getting metadata URI for each token. We'll get this URI by [uploading the asset to nft.storage](#uploading-the-asset-and-minting-the-token).

You can come up with your own contract name, token name, and token symbol instead of "Filet", but make sure to use the name consistently.

Now compile the contract `Filet.sol` using this hardhat command at your root level:

```shell
npx hardhat compile
> Compiling 1 file with 0.8.0
> Compilation finished successfully
```

Next, create a script file named `deploy.js` in the `scripts` directory and type the following code down before saving it:

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

This script uses the [Ethers](https://docs.ethers.io/v5/) library to deploy the contract to the local Avalanche node(s). Now, we can deploy the contract with this hardhat command:

```shell
npx hardhat run scripts/deploy.js --network local
> Filet deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

We now have a token contract deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`. Take note of this address output, since yours will likely be different.

## Interacting with the contract

Now let's spin up Hardhat's developer console to start playing with our `Filet` contract interactively:

```shell
npx hardhat console --network local
> Welcome to Node.js v14.18.1.
> Type ".help" for more information.
> >
```

By interacting with the console prompt, we are learning each step in a discrete way without getting distracted by the UI.

Now, type the following into the prompt to initialize the contract object (remember to use your contract address instead of the one shown below):

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

The array, unsurprisingly, should contain all the addresses listed with the previous `npx hardhat accounts` command. Let's select one of the addresses to inspect the balance of the FILET token (we are choosing the second account)

```js
>> const balance = (await filet.balanceOf(accounts[1])).toString()
> 0
```

Obviously the address `0x9632a79656af553F58738B0FB750320158495942` belonging to the second account whom we accessed with `accounts[1]` does not own any FILET token. Before we can mint a token to the address, we'll have to upload the metadata such as the image, name, and description we want to link to the token to [nft.storage](https://nft.storage).

## Uploading the asset and minting the token

Before we can continue, install `nft.storage` and `mime` libraries at the project's root level with `npm install nft.storage mime --save`.

Now we will upload an NFT's metadata -- image, name, and description -- to nft.storage and use the resulting IPFS URI in the `mintTo`. To write a script that can be imported and run on Hardhat Node REPL, create a file called `upload.mjs` inside the `/scripts` directory with the following code (replacing `NFT_STORAGE_KEY` variable with **your own API key**).

```js
import { NFTStorage, File } from 'nft.storage'

import mime from 'mime'

import fs from 'fs'

import path from 'path'

const NFT_STORAGE_KEY = 'YOUR_OWN_API_KEY'

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

Note we've received the response as a `Token` object with the `url` property. We can use this given URI to mint our first NFT to another account:

```js
>> const _tx = await filet.mintTo(accounts[1], result.url)
```

Then check the balance of the receiving account:

```js
>> const balance = (await filet.balanceOf(account[1])).toString()
>> balance
> 1
```

Additionally, we can check the current owner of the NFT by calling `ownerOf(tokenId)`. Since we've minted only the first token, the `tokenId` is 1:

```js
>> const tokenId = 1
>> const ownerAddress = (await filet.ownerOf(tokenId))
>> ownerAddress === account[1].address
> true
```

The receiving address now owns 1 FILET. We also confirmed that it is the owner of the first NFT.

By default `ethers` uses the first address as the signer of the transaction, therefore it is `account[0]` signing off on the minting when we call `mintTo(recipientAddress, tokenURI)`.

>> 💡 **What was returned from `mintTo(...)`?**   
>> You might wonder why, when we called `mintTo(...)` previously, we assigned the returned value to an unused variable called `_tx`, instead of using the expected returned `UInt256` token's ID in the next call to `ownerOf(tokenId)` to inspect the token's owner.   
>> That's because the return value of a non-pure or non-view Solidity function is available only when the function is called *on-chain* (from the same contract or another contract). In our case, our little hardhat prompt is an *off-chain* client. For example, the method [`balanceOf(...)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/7392d8373873bed5da9ac9a97811d709f8c5ffbb/contracts/token/ERC721/ERC721.sol#L62) is a view function because it only reads from the chain.   
>> When a non-pure or non-view function is called off-chain, the return value is always the hash of the transaction, not the intended return value from the function. So when we called `mintTo(...)`, we received the transaction object, not the token ID we expected. We assigned it to `_tx` to emphasize that it was a transaction (tx) object, and preceded it with an underscore to emphasize that we weren't using it.   
>> Learn more about [view and pure functions](https://solidity-by-example.org/view-and-pure-functions/) and [subscribing to an event to get the returned value](https://ethereum.stackexchange.com/questions/88119/i-see-no-way-to-obtain-the-return-value-of-a-non-view-function-ethers-js). Additionally, check out [`callStatic`](https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract/-%23-contract-callStatic) method which is helpful in testing your calls and returned values.


## Retrieving a token's metadata

The final step is to retrieve the metadata for each token from IPFS so you can display the token's image, name, and description on the web. With ERC721Storage, we can call [`tokenURI(uint256 tokenId)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol#L20) to retrieve the tokenURI stored on-chain:

```js
>> let ipfsURI = await filet.tokenURI(tokenId.toNumber())
>> ipfsURI
> 'ipfs://bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue/metadata.json'
```

Because there are browsers which do not yet support IPFS URLs natively, as well as the standard `fetch` API, nft.storage Javascript client includes a helper function that converts this IPFS URI into an HTTPS version via the nftstorage.link gateway. On the console, you can import this function `toGatewayURL` from `nft.storage`:

```js
>> const { toGatewayURL } = await import("nft.storage")
>> const { href } = await toGatewayURL(ipfsURI)
>> href
> 'https://nftstorage.link/ipfs/bafyreicb3ewk33keh77mwxhmhdafxsjlkflichr2mjnyim6tbq3qjkwcue/metadata.json'
```

🎉  Congratulations! You have learned to build an NFT store on Avalanche. Now go on and take on the world!
