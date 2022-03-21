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

### Create a keystore user

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

With Node.js already installed, run `npm init` to create an app directory, then `cd` into your new directory and run `npm install hardhat --save-dev` to install [Hard Hat](https://hardhat.org/getting-started/).



