---
title: First steps
description: A step-by-step guide to getting started as an NFT developer.
---
 # First steps

## Pre-requisites

Readers should:

- Know how to read and write JavaScript (ES2017+)
- Understand the fundamentals of how Ethereum smart contracts work
  - TODO(yusef): add links to background info here

Nice to have, but not strictly required:
- Familiarity with Solidity

## Setting up your environment

We'll be interacting with a contract that's been deployed to the Ropsten testnet. 
This means that you won't need to set a smart contract development framework or a local blockchain for development.
If you'd rather run the contract locally, clone [this repo][example-contract-repo] and follow the instructions in the README.

To get ready to work with the testnet contract, you'll need to install a few things. You'll also need to get some free test Eth, to
pay for smart contract interactions.

### Install MetaMask

[MetaMask](https://metamask.io/) is a browser extension that connects web applications to Ethereum and other blockchain networks. 

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

### Create an NPM project

- create a directory for the project and enter it
- `npm init` and answer the prompts
- install dependencies:
  - `npm install --save ethers`

### Interacting with smart contracts

- introduce ethers.js
- show how to connect ethers to MetaMask
  - https://docs.ethers.io/v5/getting-started/#getting-started--connecting

- show how to connect to a deployed "Greeter" contract on Ropsten
  - default sample from new HardHat project, Greeter.sol
    - source is here: https://hardhat.org/getting-started/#compiling-your-contracts

- reader needs some info about the contract, in order to connect to it:
  - address on Ropsten: `0xa0292C79201F0a6F67ae47F6760AEC26B1913Bc6`
  - contract ABI (see json below). We can save to a json file and have them download to somewhere we can read it from javascript.

```json
{
  "abi": [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "greet",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "name": "setGreeting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}
```

Once you have those, you can get an ethers `Contract` instance:

```javascript
async function getGreeting() {
  const { abi } = await hre.artifacts.readArtifact("Greeter")
  const greeter = new hre.ethers.Contract(ROPSTEN_ADDR, abi, hre.ethers.provider)

  const greeting = await greeter.greet();

  console.log("Greetings: ", greeting);
}
```

## More Resources

### Solidity documentation and tutorials

TODO(yusef): link to other tutorials of similar scope + reference materials for more depth



[solidity-docs]: https://docs.soliditylang.org/en/latest/

<!-- FIXME: fix link once repo exists -->
[example-contract-repo]: https://example.com/fixme