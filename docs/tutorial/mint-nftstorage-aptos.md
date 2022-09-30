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
>> Log file: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet/validator.log"
>> Test dir: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet"
>> Aptos root key path: "/Users/pancy/Code/aptos/aptos-core/ecosystem/typescript/sdk/examples/typescript/.aptos/testnet/mint.key"
>> Waypoint:
>> 0:6ad821c9acd8f9e4fbce3fc65e851c4e1c8d7074399ba7f61a5546fa855034b2
>> ChainId: testing
>> REST API endpoint: http://0.0.0.0:8080
>> Metrics endpoint: http://0.0.0.0:9101/metrics
>> Aptosnet Fullnode network endpoint: /ip4/0.0.0.0/tcp/6181
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
> npm install typescript @types/node ts-node --save-dev
> npm install aptos dotenv nft.storage files-from-path --save
```

Then, create a `tsconfig.json` to define the TypeScript compiler options:

```shell
> npx tsc --init --rootDir src --outDir build \
  --esModuleInterop --resolveJsonModule --lib es6 \
  --module commonjs --allowJs true --noImplicitAny true
```

Next, create a `.env` file with the following variables:

```yaml
NODE_URL=http://localhost:8080
FAUCET_URL=http://localhost:8081
NFTSTORAGE_KEY=<your_api_key_here>
```

Then, create a new directory named `metadata` and add the following files to the directory:

- collection.json
- blazedragon.jpg
- blazedragon.json

`collection.json` can contains an arbitrary data about the collection holding the token(s). It can look like this:

```json
{
  "name": "Alice's Wonderful Collection",
  "description": "Alice's first NFT collection",
}
```

`blazeddragon.json` will contain some arbitrary metadata about the NFT we Alice is minting. It can look like this:

```json
{
  "name": "Blazed Dragon",
  "level": 1,
  "age": 0,
  "skin": "Dark"
}
```

`blazeddragon.jpg` is of course an image/artwork representing the NFT.

Then, start another TypeScript module named `upload.ts` in the root directory with the following code:

```typescript
import { NFTStorage }  from "nft.storage"
import { filesFromPath } from "files-from-path"
import path from "path"

const NFTSTORAGE_KEY = process.env.NFTSTORAGE_KEY || ''

async function upload(directoryPath: string) {
  const storageClient = new NFTStorage({ token: NFTSTORAGE_KEY })
  const files = filesFromPath(directoryPath, {
    pathPrefix: path.resolve(directoryPath),
    hidden: true,
  })

  const cid = storage.storeDirectory(files)
  const status = await storage.status(cid)
  return cid
}

export default upload
```


Now, start another file named `first_nft.ts` in the root directory with the following code:

```typescript
import dotenv from "dotenv"
dotenv.config()

import upload from "upload"
import { 
  AptosClient, AptosAccount, FaucetClient, TokenClient, CoinClient } from "aptos"


(async () => {
  const client = new AptosClient(NODE_URL)
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL)

  const tokenClient = new TokenClient(client)

  const coinClient = new CoinClient(client)

  // Create accounts.
  const alice = new AptosAccount()
  const bob = new AptosAccount()

  // Fund accounts with Aptos coins
  await faucetClient.fundAccount(alice.address(), 20_000)
  await faucetClient.fundAccount(bob.address(), 20_000)

  const collectionName = "Alice's Collection"
  const tokenName = "Magic Mushroom"
  const tokenPropertyVersion = 0

  const tokenId = {
    token_data_id: {
      creator: alice.address().hex(),
      collection: collectionName,
      name: tokenName,
    },
    property_version: `${tokenPropertyVersion}`,
  }

  let cid = ""
  try {
    cid = await upload("/path/to/metadata/")
  } catch (err) {
    throw err
  }

  // Create the collection for Alice.
  const txnHash1 = await tokenClient.createCollection(
    alice,
    collectionName,
    "Alice's simple collection",
    `ipfs://${cid}/collection.json`,
  )

  await client.waitForTransaction(txnHash1, { checkSuccess: true })

  // Create a token in Alice's collection. The supply is 1 (distinct) for an NFT.
  const txnHash2 = await tokenClient.createToken(
    alice,
    collectionName,
    tokenName,
    "Alice's simple token",
    1,
    `ipfs://${cid}/blazedragon.jpg`,
  )

  await client.waitForTransaction(txnHash2, { checkSuccess: true })

  const collectionData = await tokenClient.getCollectionData(alice.address(), collectionName)
  console.log(`Alice's collection: ${JSON.stringify(collectionData, null, 4)}`)

  const aliceBalance1 = await tokenClient.getToken(
    alice.address(),
    collectionName,
    tokenName,
    ${tokenPropertyVersion},
  )

  console.log(`Alice's token balance: ${aliceBalance1["amount"]}`)

  const txnHash3 = await tokenClient.offerToken(
    alice,
    bob.address(),
    alice.address(),
    collectionName,
    tokenName,
    1,
    tokenPropertyVersion,
  )

  await client.waitForTransaction(txnHash3, { checkSuccess: true })

  const txnHash4 = await tokenClient.claimToken(
    bob,
    alice.address(),
    alice.address(),
    collectionName,
    tokenName,
    tokenPropertyVersion,
  )

  await client.waitForTransaction(txnHash4, { checkSuccess: true })

  const aliceBalance2 = await tokenClient.getToken(
    alice.address(),
    collectionName,
    tokenName,
    `${tokenPropertyVersion}`,
  )

  const bobBalance2 = await tokenClient.getTokenForAccount(bob.address(), tokenId)

  
})




```











<ContentStatus />
