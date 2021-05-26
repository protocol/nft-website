---
title: First steps
description: A step-by-step guide to getting started as an NFT developer.
---

# First steps

Developing apps and experiences for NFTs requires a bit of background knowledge and experience with blockchain smart contracts. This guide will walk through interacting with a simple "hello world" smart contract from JavaScript, just to get acquainted with the tooling and libraries we'll use in later guides.

If you're already familiar with the basics of interacting with smart contracts, you can skip this guide and jump into [developing an end-to-end experience](./end-to-end-experience.md).

## Prerequisites

To follow along, you should be familiar with modern `async`/`await`-style JavaScript.

If you've never heard the words "Solidity", "EVM", or "smart contract" before, it might be best to [learn about the basics](https://ethereum.org/en/developers/docs/intro-to-ethereum/) before diving in. That said, we won't be writing any smart contracts in this tutorial, so you should be able to follow along without needing to learn a new programming language.

## Smart contracts

A _smart contract_ is any program that runs on a blockchain and uses a blockchain's ability to track state, process transactions, and interact with addresses. In the case of Ethereum, smart contracts can be written in Solidity or Vyper. We'll cover cover smart contract development with Solidity in other topics on NFT School, but in this tutorial, we'll focus on interacting with smart contracts that already exist.

## Blockchain environments

There are three environments for a blockchain network: mainnet, devnet, and testnet.

### mainnet

The _mainnet_ is the official production network. It is considered the source of truth, and its tokens can be exchanged for "real world" money in various ways. As you might imagine, using the mainnet for development and testing is an expensive proposition.

### devnet

To make smart contract development practical, you can run a local development network, or _devnet_. This is usually a kind of lightweight simulator that has the same API as the mainnet, but runs on your development machine for fast feedback and iteration. The most popular devnets are bundled into blockchain development frameworks and provide quality-of-life features such as console logs and stack traces. For Ethereum, the main devnets are [Ganache](https://www.trufflesuite.com/ganache), which is part of the [Truffle Suite](https://www.trufflesuite.com), and the [Hardhat network](https://hardhat.org/hardhat-network/), which is integrated into the [Hardhat framework](https://hardhat.org/hardhat-network/).

### testnet

Because devnets are a simplified simulation of the real network, they don't always behave in quite the same way. This is a good thing when you want fast development cycles, but not so great when you want to know how your contract will actually work on mainnet.

For that, you can deploy and run your contract on a test network, or _testnet_. These networks generally run the same code as the mainnet, but they have separate blockchain states and may be configured differently in various ways.

## Building our app

For this guide, we'll be interacting with a contract that's been deployed to the Ropsten testnet. This lets us skip choosing and installing a devnet, but we will still need to do a bit of setup.

### Get some testnet ETH with MetaMask for Chrome

[MetaMask](https://metamask.io/) is a browser extension that connects web applications to Ethereum and other blockchain networks. It's also an Ethereum _wallet_, meaning that it manages the private keys used to authorize Ethereum transactions, and can store Ethereum tokens (ETH).

1) Go to [https://metamask.io/download.html](https://metamask.io/download.html) and install MetaMask for Chrome.
2) Create an account and save your seed phrase. This will give you access to your Ropsten testnet wallet address.
3) In Chrome, open the MetaMask extension. Click the drop-down in the top right to switch networks and select the Ropsten network.
4) Click the **Buy** button and scroll down. Under the **Test Faucet** heading, click the **Get Ether** button. This will take you to the ETH testnet faucet, where you can request free testnet ETH tokens. These do not have monetary value, since they cannot be traded on an exchange, but functionally they behave the same as ETH tokens on the mainnet. This allows us to develop blockchain programs that will work on mainnet without spending any money.

::: tip Helpful hint
If you have an existing ETH wallet on mainnet, it's a good idea to create a new wallet for testnet. This makes it harder to accidentally send mainnet ETH to a testnet wallet address, which burns the mainnet ETH forever.
:::

After following these steps, a transaction is generated that will mint a testnet ETH token and send it to your wallet. This might take a few minutes to complete. You can monitor the transaction progress by clicking the link to the transaction ID on the faucet homepage, which will take you to [the blockchain explorer for Ropsten testnet on etherscan.io](https://ropsten.etherscan.io).

### Download the Ethers JavaScript library

Now that we've created a testnet wallet and filled it with test ETH ready to fuel transactions on the blockchain, we are ready to do some development.

First make an empty directory named `hello-eth`:

```shell
mkdir hello-eth
cd hello-eth
```

To interact with Ethereum, we need a JavaScript library that makes [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) calls. For smart contract interactions, the two main contenders are [web3.js](https://web3js.readthedocs.io/en/v1.3.4/) and [Ethers](https://docs.ethers.io/v5/). We're using Ethers for this guide, since it's a bit easier for getting started.

On [the getting started page for Ethers](https://docs.ethers.io/v5/getting-started/#getting-started--importing--web-browser), download the Ethers library as a `.js` file. For this tutorial, we'll be using the ES6 version of the library, which should have a filename like `ethers-5.1.esm.min.js`. Place this file in the `hello-eth` directory.

### Gather the needed details

For this tutorial, we're going to connect to a smart contract called `Greeter` that's included with a new [Hardhat](https://hardhat.io) project. It's been deployed to the Ropsten testnet at the address `0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd`, and you can find details about it on the [EtherScan Ropsten block explorer](https://ropsten.etherscan.io) by searching for that address, which should take you to [the address detail view](https://ropsten.etherscan.io/address/0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd).

Ethers has a [Contract API](https://docs.ethers.io/v5/api/contract/contract/) that abstracts over the details of the blockchain and lets us interact with smart contracts as if they were regular JavaScript objects named `Contract`.

To wire up a JavaScript object to a deployed smart contract with Ethers, we need two things: the address of the contract, and its Application Binary Interface (ABI).

To get the ABI for a contract, look at the contract source code on the blockchain explorer. Here is [the source code for `Greeter`](https://ropsten.etherscan.io/address/0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd#code). You can find the ABI, which is expressed as a condensed chunk of JSON code, by scrolling down.

### Create index.html

In the `hello-eth` folder, next to `ethers-5.1.esm.min.js`, create a file called `index.html` and enter the following code. You'll see the ABI value from Etherscan and the address for the deployed Greeter smart contract declared as `const` values, and MetaMask providing access to the Ethereum blockchain via the `window.ethereum` object. That's all Ethers needs to provide a Web3 layer for you to make smart contract calls with JavaScript.

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
 <head>
  <title>Hello, Ethers!</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script type="module">
      import { ethers } from "./ethers-5.1.esm.min.js";
      //const ethers = require('ethers')

      const GREETER_ADDRESS = '0xE0282e76237B8eB19A5D08e1741b8b3e2691Dadd'
      const GREETER_ABI = `[{"inputs":[{"internalType":"string","name":"_greeting","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"greet","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_greeting","type":"string"}],"name":"setGreeting","outputs":[],"stateMutability":"nonpayable","type":"function"}]`

      async function getGreeting() {
        // Wrap the window.ethereum object injected by MetaMask with the ethers API
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Connect to the greeter contract.
        const greeterContract = new ethers.Contract(GREETER_ADDRESS, GREETER_ABI, provider);

        // Call the greet() smart contract function.
        const greeting = await greeterContract.greet();

        // Write the greeting result to the DOM.
        document.getElementById('output').innerHTML = greeting;
      }
      getGreeting();
  </script>
  </head>
  <body>
    <div id="output" />
  </body>
</html>
```

### Install and run http-server

Now you'll need to run a web server. If you haven't done so already, [install Node.js](https://nodejs.org/en/download/). Then you can install and run [`http-server`](https://www.npmjs.com/package/http-server) to serve what we've created:

```shell
npm install --global http-server
http-server .
```

The web server should provide URLs for you to copy/paste into your browser:

```
Starting up http-server, serving .
Available on:
  http://127.0.0.1:8081
  http://192.168.2.10:8081
  http://192.168.86.24:8081
```

Visiting any of these URLs in your browser will produce the message `Hello, Hardhat!`, which means that Ethers has made a call to the Greeting smart contract that Hardhat deployed to the Ropsten testnet.

## Conclusion

Great work! Now you have an easy route to interacting with smart contracts with JavaScript right in your browser, a Ropsten Testnet account loaded with ETH for fuel, and a general outline for building apps on top of Ethereum. After this crash course, you're ready to start getting into minting NFTs in our [end-to-end tutorial](end-to-end-experience.md).

## More resources

Here are a few resources to learn more about Ethereum development.

- The official [Intro to Ethereum](https://ethereum.org/en/developers/docs/intro-to-ethereum/) guide.
- [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) — a batteries-included starter kit for full-stack dApp development.
- The official [Solidity documentation](https://docs.soliditylang.org/en/latest/).
- [Ethereum basics](https://docs.ethers.io/v5/concepts/) from Ethers.
