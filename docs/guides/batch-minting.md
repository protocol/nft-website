---
title: Batch-minting NFTs on Ethereum
description: This tutorial addresses some techniques in batch-minting big numbers of Ethereum non-fungible tokens (NFTs) as well as common patterns for uploading files and metadata to IPFS and Filecoin via NFT.storage.
issueUrl: https://github.com/protocol/nft-website/issues/253
related: 
  'Lazy minting': https://nftschool.dev/tutorial/lazy-minting/
---

 # Batch-minting NFTs on Ethereum

This tutorial addresses some techniques in batch-minting big numbers of Ethereum non-fungible tokens (NFTs) as well as common patterns for uploading files and metadata to IPFS and Filecoin via NFT.storage.

See also: [Lazy minting](../tutorial/lazy-minting.md)

Quite often,  NFT projects consist of hundreds if not thousands of files and metadata starting their lives out on a computer file system, waiting nervously to be part of a mint.

There are cases in which it is desirable to mint many NFTs all at once instead of doing each of them in a [just-in-time](../tutorial/lazy-minting.md) fashion. Large single drops are often for more than just art, including scenarios like large PFP (profile picture) drops, event tickets, game packs, and etc.

Some challenges that lie in minting a bulk of NFTs include high gas fees on the Ethereum network, synchronizing between mint and upload failures and recovering from them, and performance of uploading files to NFT.storage, etc.

## Batch-uploading NFT assets

Here is an overview of strategies you can choose from to upload to NFT.storage in bulk. 

### Drag-and-drop uploading with NFTUp
[NFTUp](https://nft.storage/blog/post/2022-04-05-announcing-nftup/) is a downloadable application for adding data to NFT.Storage. Content creators can drag-and-drop metadata and assets, from individual files to large directories. Once uploaded, they are ready to be minted into NFTs by smart contracts and then traded on marketplaces or browsed in galleries.


### Upload files iteratively

The most straightforward, yet more involved way to upload files and metadata to NFT.storage with code is by iterating over all of them and calling [`NFTStorage.store`](https://nftstorage.github.io/nft.storage/client/classes/lib.NFTStorage.html#store) one-by-one. While this seems straightforward on paper, it can create more complexity for your application. You are responsible for properly handling errors that might occur for each successive request and synchronize it with the minting process.

```javascript

async function readAndUpload() {
  const promises = Array.from({length: 10}, (v, i) => i)
      .map(async (i) => {
        const image = (await fetch(`$creature-{i}.jpg`)).blob()
        return {
          image,
          name: `$creature-{i}`,
          description: `Metadata of creature-${i}`,
        }
      })

  const client = new NFTStorage({ token })
  const results = await Promise.all(promises)

  await Promise.all(results.forEach(result => {
    const metadata = await client.store(resuilt)
    console.log('Metadata URI: ', metadata.url)
  }))
}

```

### Upload directory of files

Alternatively, you can use the [NFTStorage.storeDirectory](https://nftstorage.github.io/nft.storage/client/classes/lib.NFTStorage.html#storeDirectory) method to upload all the files stored in a local directory.

This method handles many things under the hood for you, including rate-limiting for each request. [NFTStorage.storeDirectory](https://nftstorage.github.io/nft.storage/client/classes/lib.NFTStorage.html#storeDirectory) will shard the directory when it gets to a certain size, so if you have thousands of related files to upload you should definitely use this.

```javascript

import path from 'path'
import { NFTStorage } from 'nft.storage'
import { fileFromPath } from 'files-from-path'

async function readAndUploadDir() {
  const files = filesFromPath(dirpath, {
		pathPrefix: path.resolve(dirpath),
		hidden: true,
	})
  const storage = new NFTStorage({ token })
  const cid = await storage.storeDirectory(files)
  const status = await storage.status(cid)

  console.log(status)
}

```

### Performance and Tradeoffs

Both `store` and `storeDirectory` methods calls [`storeCar`](https://nftstorage.github.io/nft.storage/client/classes/lib.NFTStorage.html#storecar) under the hood, which encode the payload to [CAR format (Content Addressable aRchives)](https://ipld.io/specs/transport/car/carv1/#summary) and upload to the `/upload` HTTP endpoint.

> A naive benchmark using 12 threads and 400 connections to `/upload` API endpoint (`store` and `storeDirectory` methods), ignoring errors and rate limits:

|  Thread Stats  |   Avg   |   Stdev   |   Max    |  +/- Stdev   |
|----------------|---------|-----------|----------|--------------|
|    Latency     | 52.44ms | 219.48ms  | 2.00s    | 95.86%       |
|    Req/Sec     | 6.44    |  8.60     | 60.00    | 89.44%       | -->

Comparing between two approaches, one can arrive at several comparisons.

#### Iterative upload with `store`

- For a single file, it is about 60% faster to `store` a single file than to use `storeDirectory`.
- Requires sending multiple HTTP requests to `/upload` (1,000 files == 1,000 requests) which is prone to errors and triggering rate limit.
- Can be used to upload ERC-721 and ERC-1155 standard metadata that is linked with the NFT asset in a single CID.
- Multiple CIDs to maintain for all the uploaded files.

#### Directory upload with `storeDirectory`

- Slower than `store` on a single call to `storeDirectory` with a single file.
- Returns a single, versatile CID of the root directory that can be used to query other asset files under that directory.
- Single atomic request and error handling.
- Only upload a directory of raw asset data, which will require uploading metadata separately and link it to each asset.

In practice, except for some special cases, we recommend using `storeDirectory` for more reliability and maintainability when uploading bulk NFT files.

> See also: [Store and mint NFTs using ERC-1155 metadata standards](https://nft.storage/docs/how-to/mint-erc-1155/#uploading-your-images-assets-and-metadata).

## Batch-minting in smart contracts

Now that you've learned how to upload bulk assets, let's explore a few tactics to batch-mint NFTs on the Ethereum blockchain.

### Using ERC-1155 for batch-minting

The best way to go about this if you are starting from scratch is to bite the bullet and learn to build with [ERC-1155 token standard](https://docs.openzeppelin.com/contracts/3.x/erc1155). ERC-1155 is a multi-token standard that can handle *fungible-agnostic** tokens in a single contract without resorting to ERC-20 for fungible and ERC-721 for non-fungible tokens.

> *Note: Fungible-agnostic means the quality to be both fungible (breakable into small units and thus interchangeable) and non-fungible (atomic, non-breakable a.k.a NFTs)

ERC-1155’s `balanceOf` method differs from ERC20’s and ERC777’s—it has an additional `id` argument [`balanceOf(address account, uint256 id) -> uint256`](https://docs.openzeppelin.com/contracts/3.x/api/token/erc1155#IERC1155-balanceOf-address-uint256-). This `id` is not a conventional “token ID” of an NFT but a type ID.

Unlike ERC-721, whose [`balanceOf(address account)`](https://docs.openzeppelin.com/contracts/3.x/api/token/erc721#IERC721-balanceOf-address-) only counts the amount of a single token type represent by a single contract, ERC-1155 contract can holds many types of tokens, each with its own `id`. Non-fungible tokens are then implemented by simply minting a single one of them (one `id` for one NFT, thus unique).

### Batch operators

The ERC-1155 standard provides two methods,`balanceOfBatch` and `safeBatchTransferFrom` that mae querying multiple balances and transferring multiple tokens simpler and less gas-intensive. Especially the standard provided the function _mintBatch which allows batch minting of several token ids of any amount. For example, to batch-mint 100 NFTs, you would call it with an array of ids and amounts:

```solidity

ERC1155._mintBatch(receiverAddress, [5, 6, 7, 8, /* ... */, 105],  [1, 1, 1, 1, /* ... */ 1], "");

```

Because each id token is distinct, minting each one with the amount of 1 makes them non-fungible.

### Event tickets example

Let's take a look at an example: minting event tickets as NFTs. As we sell the tickets, we do not necessarily want to mint each token for each sale and pay individual gas. We may have a tiny server to keep track of who bought the tickets and mint them all just before the event.

Here is an implementation:

```solidity

// contracts/EventTickets.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract EventTickets is ERC1155 {
  // Declare all the type IDs
  uint256 public constant GENERAL = 0;
  uint256 public constant VIP = 1;
  uint256 public constant RSVP = 2;

  constructor() public ERC1155("ipfs://storage.link/bafyreidtc6fs4xrnc5b7klvvtrs2bsijkt54qqnonk54stkjj3rtdb5wee/{id}.json") {
    _mint(msg.sender, GENERAL, 10**2, "");
    _mint(msg.sender, VIP, 1, "");
    _mint(msg.sender, RSVP, 20, "");
  }
}

```

As you can see, the VIP ticket is an NFT because only a single one is minted, while the GENERAL (for general admission) and RSVP (for reserved seating) are fungible tokens.

We could, of course, replace the 3 calls to `_mint` with a single call to `_mintBatch` like so:

```solidity

_mintBatch(msg.sender, [GENERAL, VIP, RSVP], [10**2, 1, 20], "");

```

## Piggyback-minting for ERC-721 with Chainlink gas price feed

For those who are stuck with ERC-721 contracts, batch-minting means going through an often tedious process of iterating minting calls, often blind to the gas penalties. To ease on the gas fee, one idea is to run a cron-like process to poll the current Ethereum gas price (gWei) using [Chainlink Fast Gas](https://data.chain.link/ethereum/mainnet/gas/fast-gas-gwei) price feed and use the windows of opportunity when the gas prices are low to mint in an asynchronous manner.

Here is an example of enquiring the gas price from the Chainlink’s [`EACAggregatorProxy` contract](https://etherscan.io/address/0x169e633a2d1e6c10dd91238ba11c4a708dfef37c#code#L1) within your own ERC-721 contract, using a “Piggyback” method to mint the backlogged mints when the gas is cheap (a.k.a the "Tide-is-high" method).

```solidity

// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameItem is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint256 const MAX_GAS_PRICE = 20000000000;

  // Record of an unminted item and the player/recipient.
  // You can use a map instead of a struct.
  struct Unminted {
    address player;
    string tokenURI;
  }

  // Keep record of unminted backlogs as a dynamic
  // array of Unminted objects.
  Unminted[] private backlogs;

  // Declare the feed contract.
  EACAggregatorProxy public gasfeed;

  // Pass the EACAggregatorProxy contract address to the contructor
  // in order to initialize the gasfeed contract.
  constructor(address feed) ERC721("GameItem", "ITM") {
    gasfeed = address
  }

  function awardItem(address player, string memory tokenURI)
      public
      returns (uint256)
  {
      uint256 newItemId = _tokenIds.current();

      // Mint only if the gas price is satisfactory. Otherwise, we push
      // to the backlogs array for to be minted later.
      if (getLatestGasPrice() <= MAX_GAS_PRICE) {
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds.increment();

        // Tide is high! Let's mint the backlogs while the gas price is low.
        if (backlogs.length > 0) {
          for (uint i=0; i<backlogs.length; i++) {
            _mint(backlogs[i].player, backlogs[i].tokenURI);
            _tokenIds.increment();
            _setTokenURI(_tokenIds.current(), backlogs[i].tokenURI);
          }
        }

      } else {
        backlogs.push(Unminted(player, tokenURI));
      }

      return newItemId;
  }

  function getLatestGasPrice() publivc view returns (uint256)  {
    var (_roundId, answer, _startedAt, _updatedAt, _answeredInRound) = gasfeed.latestRoundData();
    return answer;
  }
}

```

To deploy the contract, don't forget to pass the Chainlink’s aggregator contract address into deploy function of the contract factory:

```javascript

const AGGREGATOR_ADDRESS = "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C"
let GameItemFactory = await ethers.getContractFactory("GameItem")
let gameItem = await GameItemFactory.deploy(AGGREGATOR_ADDRESS)
await gameItem.deployed()
console.log(`GameItem deployed to: ${gameItem.address}`)

```

### ERC-721A: An Alternative

[ERC-721A](https://www.erc721a.org/) is an alternative ERC-721 implementation by the Azuki NFT development team. It was designed primarily for batch-minting with very low gas fees compared to conventional ERC-721 and ERC-1155. According to the developers, the new algorithm enables minting multiple NFTs for essentially the same cost as minting a single NFT at the expense of more complexity by means of several optimization tactics, such as removal of duplicate storage from OpenZeppelin’s ERC721Enumerable and updating the owner’s balance and other data once per batch mint request instead of per minted NFT. This is a relatively new standard, so please take particular care to evaluate risks and possibilities before choosing it.

## Conclusion

There are multiple ways to approach batch-upload and -minting hundreds or thousands of your NFTs and their assets on NFT.storage and Ethereum. However, the most recommended way is to employ `storeDirectory` or NFTUp to upload files on NFT.storage, and `ERC-1155` for batch-minting on Ethereum.