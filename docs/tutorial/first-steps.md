---
title: First steps
description: A step-by-step guide to getting started as an NFT developer.
---
# First steps

Developing apps and experiences for NFTs requires a bit of background knowledge and experience with blockchain smart contracts. This guide will walk through interacting with a very simple "hello world" smart contract from JavaScript, just to get acquainted with the tooling and libraries we'll use in later guides.

If you're already familiar with the basics of interacting with smart contracts, you can skip this guide and jump into [developing an end-to-end experience](./end-to-end-experience.md).

## Pre-requisites

To follow along, you should be familiar with modern `async`/`await` style JavaScript.

If you've never heard the words "Solidity", "EVM", or "smart contract" before, it might be best to [learn about the basics](https://ethereum.org/en/developers/docs/intro-to-ethereum/) before diving in. That said, we won't be writing any smart contracts in this tutorial, so you should be able to follow along without needing to learn a new programming language.

## Connecting to Ethereum

There are generally three main execution environments for a blockchain network. 

The "mainnet" is the official production network, which is considered the source of truth, and whose tokens can be exchanged for "real world" money in various ways. As you might imagine, using the mainnet for development and testing is an expensive proposition. 

To make smart contract development practical, you can run a local development network ("devnet"), which is usually a kind of lightweight simulator that has the same API as the mainnet but runs on your development machine for fast feedback and iteration. The most popular devnets are bundled into blockchain development frameworks and provide quality-of-life features like console logs and stack traces. For Ethereum, the main devnets are [Ganache](https://www.trufflesuite.com/ganache), which is part of the [Truffle Suite](https://www.trufflesuite.com), and the [HardHat network](https://hardhat.org/hardhat-network/), which is integrated into the [HardHat framework](https://hardhat.org/hardhat-network/).

Because devnets are a simplified simulation of the real network, they don't always behave in quite the same way. This is a good thing when you want fast development cycles, but not so great when you want to know how your contract will actually work on mainnet. For that, you can deploy and run your contract on a test network (or "testnet"). These networks generally run the same code as the mainnet, but they have separate blockchain states and may be configured differently in various ways.

For this guide, we'll be interacting with a contract that's been deployed to the Ropsten testnet. This lets us skip choosing and installing a devnet, but we will still need to do a little bit of setup.

### Install MetaMask

[MetaMask](https://metamask.io/) is a browser extension that connects web applications to Ethereum and other blockchain networks. It's also an Ethereum _wallet_, meaning that it manages the private keys used to authorize Ethereum transactions. 

TODO:
  - how to install metamask & create a wallet
  - how to switch to the Ropsten network in Metamask
  - warn that if readers have any mainnet Eth, they should create a new wallet for testnet. 
    - This makes it harder to accidentally send mainnet Eth to a testnet address / contract, which burns the mainnet Eth forever.

### Get some testnet Eth

TODO: 
- how to request test Eth from the MetaMask faucet for the ropsten network
  - https://faucet.metamask.io/
    - seems to only support Ropsten - switching MetaMask to another network changes the address of the faucet in the web UI, but the transactions are always on Ropsten
  - https://faucet.ropsten.be/
    - alternative faucet, can paste in wallet address from metamask to get test eth
  - should note that it may take a few minutes for the transaction to finalize and the Eth to show up
    - they can view the pending tx on https://ropsten.etherscan.io if they want to see the progress

### Create an NPM project

First make an empty NPM project:

```shell
mkdir hello-eth
cd hello-eth
npm init
```

NPM will ask you some questions about the project - you can just accept the defaults.

Next install the dependencies:

```shell
npm install --save ethers
```

TODO(yusef): create index.js / index.html

### Interacting with smart contracts

To interact with Ethereum, we need two things: a connection to an Ethereum node's [JSON-RPC API][docs-eth-json-rpc], and a JavaScript library to save the pain of crafting raw JSON-RPC calls. 

The JSON-RPC connection is provided by MetaMask, which connects to hosted Ethereum nodes for mainnet or any of the public testnets. You can also configure MetaMask to connect to a devnet running on your local machine or network.

For smart contract interactions, the two main contenders are [web3.js](https://web3js.readthedocs.io/en/v1.3.4/) and [ethers.js](https://docs.ethers.io/v5/). We're using ethers.js for this guide, since it's a bit easier to get started with.

#### Connecting to MetaMask

MetaMask injects an `ethereum` object into the `window` global, which we can use to connect to the network.

Here's an example pulled from the [ethers.js documentation](https://docs.ethers.io/v5/getting-started/#getting-started--connecting):

```js
// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum)

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signer = provider.getSigner()
```

#### Connecting to a contract

ethers.js gives us a [Contract API](https://docs.ethers.io/v5/api/contract/contract/) that abstracts over the details of the blockchain and lets us interact with smart contracts as if they were regular JavaScript objects.

To wire up a `Contract` object to a deployed smart contract, we need two things: the address of the contract, and its ABI, or Application Binary Interface.

For this tutorial, we're using the default `Greeter` contract that's included with a new [HardHat](https://hardhat.io) project. 
It's been deployed to the Ropsten testnet at the address `0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd`, and you can find details about it on the [EtherScan Ropsten block explorer](https://ropsten.etherscan.io) by searching for the address, which should take you to [the address detail view](https://ropsten.etherscan.io/address/0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd).

Clicking on the **Contract** tab on EtherScan, you can see the contract source code and other information, including the ABI, which you can export to a JSON file or copy to your clipboard.

::: tip
You can get the ABI for any deployed contract by searching the address on EtherScan!
:::

Here's the code you'll need to connect to the deployed contract:

```js
const ethers = require('ethers')

const GREETER_ADDRESS = '0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd'
const GREETER_ABI = `[{"inputs":[{"internalType":"string","name":"_greeting","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"greet","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_greeting","type":"string"}],"name":"setGreeting","outputs":[],"stateMutability":"nonpayable","type":"function"}]`

async function getGreeting() {
  // Wrap the window.ethereum object injected by MetaMask with the ethers API
  const provider = new ethers.providers.Web3Provider(window.ethereum)

  // Connect to the greeter contract.
  const greeterContract = new ethers.Contract(GREETER_ADDRESS, GREETER_ABI, provider)

  // Call the greet() smart contract function.
  const greeting = await greeterContract.greet()

  console.log(greeting)
}
```

TODO(yusef): walk through adding code to index.js and running the example

## More Resources

Here are a few resources to learn more about Ethereum development.

- The official [Intro to Ethereum](https://ethereum.org/en/developers/docs/intro-to-ethereum/) guide.
- [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) - a batteries-included starter kit for full-stack dApp development.
- [Solidity Documentation](https://docs.soliditylang.org/en/latest/)


[docs-eth-json-rpc]: https://eth.wiki/json-rpc/API