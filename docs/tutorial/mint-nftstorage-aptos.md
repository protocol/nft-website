---
title: Create NFT on Aptos 🚧
description: Learn how to mint your NFT using NFT.storage and Aptos
issueUrl: https://github.com/protocol/nft-website/issues/276
related:
  'Your First NFT': https://aptos.dev/tutorials/your-first-nft

---

# Create NFT on Aptos

This tutorial will guide you through getting started with minting an NFT on [Aptos](https://aptos.dev/) testnet using Node.js REPL
for an interactive learning experience.

TODO: Aptos is the new, safest and most scalable Layer1 blockchain.

## Run the local testnet node

To run the local node, first [download and install the Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli). After you have followed the instruction, make sure the CLI is in the path by running `aptos --version`, then run the following command:

```shell
> aptos node run-local-testnet --with-faucet
```

The command will start a validator node and display an output to your terminal as the following:

```shell
>> Completed generating configuration:
>> 	Log file: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet/validator.log"
>> 	Test dir: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet"
>> 	Aptos root key path: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet/mint.key"
>>	Waypoint:
>>  0:6ad821c9acd8f9e4fbce3fc65e851c4e1c8d7074399ba7f61a5546fa855034b2
>>	ChainId: testing
>> 	REST API endpoint: http://0.0.0.0:8080
>>	Metrics endpoint: http://0.0.0.0:9101/metrics
>> 	Aptosnet Fullnode network endpoint: /ip4/0.0.0.0/tcp/6181
>>
>> Aptos is running, press ctrl-c to exit
>>
>> Faucet is running.  Faucet endpoint: 0.0.0.0:8081
```

Note the REST API endpoint and the faucet endpoint URLs as we will need them to connect to our Node application.

## Start a Node project

To start a Node TypeScript project, run the following command:

```shell
> mkdir aptos-starter
> cd aptos-starter
> npm init -y
> npm install typescript @types/node --save-dev
```

Then, create a `tsconfig.json` to define the TypeScript compiler options:

```shell
> npx tsc --init --rootDir src --outDir build \
  --esModuleInterop --resolveJsonModule --lib es6 \
  --module commonjs --allowJs true --noImplicitAny true
```






>>



<ContentStatus />
