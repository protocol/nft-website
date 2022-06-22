---
title: Batch-minting NFTs on Ethereum 🚧
description: This tutorial addresses some techniques in batch-minting big numbers of Ethereum non-fungible tokens (NFTs) as well as common idioms of uploading files and metadata on to IPFS/Filecoin via nft.storage.
issueUrl: https://github.com/protocol/nft-website/issues/253
related: 
  'Lazy minting': https://nftschool.dev/tutorial/lazy-minting/
---
 # Batch-minting NFTs on Ethereum

 > TODO: Add missing links

 This tutorial addresses some techniques in batch-minting big numbers of Ethereum non-fungible tokens (NFTs) as well as common idioms of uploading files and metadata on to IPFS/Filecoin via nft.storage.

See also: [Lazy minting](./lazy-minting.md)

Quite often,  NFT projects consist of hundreds if not thousands of files and metadata starting their lives out on a computer file system, waiting nervously to be part of a mint.

There are many cases in which instead of minting NFTs just in time (or lazily) once the buyer has concluded a purchase, it is desirable to mint several all at once. Some common ones are:

- Event tickets
- Packs
- Game items

In all these scenarios, NFTs are being treated closer to commodities than in the case in which collectors collect them as discrete artworks. Some challenges that lie in minting a batch of many tokens include exceedingly high gas fees on the Ethereum network, atomically synchronizing between mint and upload failures, and performance of uploading files to nft.storage, etc.

## Pre-processing and project structure

> TODO: Add content here

## Storage

### Upload files iteratively

The most straightforward way to upload files and metadata to nft.storage is by iterating over all of them and calling [`NFTStorage.store`]() one-by-one. Being simple as it is, that means you are responsible for properly handling errors that might occur for each successive request and synchronize it with the minting process.

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
  const results = await Promise.all(ps)

  await Promise.all(results.forEach((result) => {
    const metadata = await client.store(nft)
    console.log('NFT data stored!')
    console.log('Metadata URI: ', metadata.url)
  }))
}

```

### Upload directory of files

A straightforward way is to employ the [NFTStorage.storeDirectory]() method to upload all the files stored in a local directory. This method handles many things under the hood for you, including rate-limiting for each request.

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

## Smart contracts

### Using ERC-1155 for batch-minting

ERC-1155 is a new multi-token standard that can handle fungible-agnostic tokens in a single contract without resorting to ERC-20 for fungible and ERC-721 for non-fungible tokens.

ERC-1155’s `balanceOf` method differs from ERC20’s and ERC777’s—it has an additional `id` argument [`balanceOf(address account, uint256 id) -> uint256`](). This `id` is not a conventional “token ID” of an NFT but a type ID.

Unlike ERC-721, whose [`balanceOf(address account)`]() only counts the amount of a single token type represent by a single contract, ERC-1155 contract can holds many types of tokens, each with its own `id`. Non-fungible tokens are then implemented by simply minting a single one of them (one `id` for one NFT, thus unique).

### Batch operators

The ERC-1155 standard provides two methods,`balanceOfBatch` and safeBatchTransferFrom that make querying multiple balances and transferring multiple tokens simpler and less gas-intensive. Especially the standard provided the function _mintBatch which allows batch minting of several token ids of any amount. For example, to batch-mint 100 NFTs, you would call it with an array of ids and amounts:

```solidity

ERC1155._mintBatch(receiverAddress, [5, 6, 7, 8, /* ... */, 105],  [1, 1, 1, 1, /* ... */ 1], "");

```

Because each id token is distinct, minting each one with the amount of 1 makes them non-fungible.

### Event tickets example

To give you an example of minting event tickets as NFTs. As we sell the tickets, we do not necessarily want to mint each token for each sale. We may have a tiny server to keep track of who bought the tickets and mint them all just before the event.

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

## Batch-minting for ERC-721

For those who are stuck with ERC-721 contracts, batch-minting means going through an often tedious process of iterating minting calls, often blind to the gas penalties. To ease on the gas fee, one idea is to run a cron-like process that poll the current Ethereum gas price (gWei) using Chainlink Fast Gas price feed and use the windows of opportunity when the gas prices are low to mint in an asynchronous manner.

Here is an example of enquiring the gas price from the Chainlink’s [`EACAggregatorProxy`]() contract within an ERC-721 contract, using a “Piggyback” minting technique to mint the backlogs when the gas is cheap.

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

        // Piggyback-mint the backlogs when the gas price is cheap.
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

> TODO: Walkthrough code here

And to deploy the contract, just pass the Chainlink’s aggregator contract address into deploy function of the contract factory:

```javascript

const AGGREGATOR_ADDRESS = "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C"
let GameItemFactory = await ethers.getContractFactory("GameItem")
let gameItem = await GameItemFactory.deploy(AGGREGATOR_ADDRESS)
await gameItem.deployed()
console.log(`GameItem deployed to: ${gameItem.address}`)

```

## Performance

> TODO: Add performance considerations for each method

### ERC-721A: An Alternative

[ERC-721A]() is an alternative ERC-721 implementation by the Azuki NFT development team. It was designed primarily for batch-minting with very low gas fees compared to conventional ERC-721 and ERC-1155. According to the developers, the new algorithm enables minting multiple NFTs for essentially the same cost as minting a single NFT at the expense of more complexity by means of several optimization tactics, such as removal of duplicate storage from OpenZeppelin’s ERC721Enumerable and updating the owner’s balance and other data once per batch mint request instead of per minted NFT.

> TODO: Wrap here

<ContentStatus />