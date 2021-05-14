---
title: First steps
description: A step-by-step guide to getting started as an NFT developer.
---
 # First steps

Before we start interacting with NFTs, lets get familiar with some basic smart contract development concepts and tooling. 

This tutorial will guide you through setting up a local development environment for Ethereum and interacting with a simple smart contract. While many alternative blockchains have emerged in recent years that can be used to create NFTs, starting with Ethereum lets us benefit from the mature ecosystem of tooling, tutorials, and reference material produced by the Ethereum community.

A vast ecosystem of tooling and reference material can be great, but it can also be overwhelming, especially if you're just getting started. This guide will focus on a few tools that are modern, well-tested, and easy to get started with. As you get more familiar with smart contract development, you may want to try other combinations of tools, libraries, and so on. The [More Resources](#more-resources) section has links to some alternatives for each of the tools we'll be using here.

Decentralized app development is broadly split into two "domains" or focus areas.

First are the smart contracts themselves, which are written in a special-purpose language and are executed by the nodes that make up the peer-to-peer blockchain network. In the [Working with Solidity](#working-with-solidity) section below, we'll show how to set up a development environment for Ethereum's main smart contract language, Solidity.

Once the contract is written, you need a way to interact with it. In the second part of this tutorial, [Ethereum Web Development](#ethereum-web-development), we'll show how to call smart contract functions from JavaScript or TypeScript as part of a decentralized web application. 

## Working with Solidity

Ethereum smart contracts run on the Ethereum Virtual Machine (or **EVM**), a distributed runtime environment maintained by Ethereum miners. The most popular and mature language that runs on the EVM is [Solidity][solidity-docs], which compiles down into a compact bytecode form that is stored on the blockchain and executed.

### Setting up an editor / IDE

There's a good chance your favorite text editor has a plugin for Solidity.

TK: list of editor plugins (see https://github.com/ConsenSys/ethereum-developer-tools-list#ides)

Maybe: link to [Remix](https://remix.ethereum.org/) as a way to play around with Solidity without installing anything locally.

### Using a development framework

Frameworks like [HardHat](https://hardhat.org/) and [Truffle](https://www.trufflesuite.com/truffle) help manage the complexity of Solidity development by providing conventions and tooling for contract compilation, deployment, and testing.

#### Creating a project with HardHat

This guide will use HardHat to compile and deploy contracts.

TK: cover how to create a new npm project and install and setup hardhat. (https://hardhat.org/getting-started/#installation)

### Compiling your first contract

TK: 

- have reader copy/paste a hello world contract and compile it using `npx hardhat compile`
- show that the compiled artifact is created in `./artifacts/contracts/<contract-name>.sol/<contract-name>.json`
- explain that the artifact json contains the info needed to interact with the contract from javascript, etc

### Deploying to a development blockchain

- Show how to run a standalone instance of the [HardHat network](https://hardhat.org/hardhat-network/) by running `npx hardhat node`.
  - explain that you can use this instance in future `hardhat` commands by using the `--network localhost` flag
- Have the reader copy paste a deployment script into `scripts/deploy.js` (see example at https://hardhat.org/guides/deploying.html)
- Run deployment script with `npx hardhat run --network localhost scripts/deploy.js`
- Show screenshot of HardHat network console output to show effect of deployment script

## Ethereum Web Development

### Connect to Ethereum using MetaMask

[MetaMask](https://metamask.io/) is a browser extension that connects web applications to Ethereum and other blockchain networks. 

TK:
  - how to install metamask
  - how to configure metamask to use the localhost HardHat network at `http://localhost:8545`

### Interacting with smart contracts

TK:
- introduce ethers.js
- show how to connect ethers to MetaMask
- show some example smart contract function calls

## More Resources

### Solidity documentation and tutorials

TK: link to other tutorials of similar scope + reference materials for more depth

### Alternative tools

TK: 
- link to Truffle Suite as alternative to HardHat
- web3.js as alternative to ethers.js
- vyper as alternative to Solidity (pretty niche, but probably worth a link)

[solidity-docs]: https://docs.soliditylang.org/en/latest/