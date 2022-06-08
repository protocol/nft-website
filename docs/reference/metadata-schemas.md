---
title: Metadata schemas
description: A helpful, handy guide to metadata schemas for NFT developers.
---
 # Metadata schemas

As described in the [NFT basics concept guide](../concepts/non-fungible-tokens.md), an NFT is a digital asset that can be bought and sold on a blockchain network. The value of an NFT is based on what it _represents_ — for example, an image, video, or game asset. To make an NFT represent something, we use _metadata_.

[Metadata](https://wikipedia.org/wiki/Metadata) is data that provides information about other data; in the case of an NFT, it describes that NFT's essential properties, including its name, description, and anything else its creator feels is important. In many cases, an NFT's metadata also contains links to the images and other "primary" digital assets that give an NFT its value.

Because [NFT marketplaces](nft-marketplaces.md) leverage metadata to display NFTs to buyers and sellers, it's important for that metadata to be in a format that marketplaces can understand. To make your NFTs compatible with as much of the ecosystem of marketplaces, wallets, and other NFT tooling as possible, you should adopt an existing metadata standard, and if need be, extend it with your specific needs.

This reference guide shows some of the most common and useful metadata formats used by NFTs today. If your favorite standard isn't included, please [open an issue](https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=open-an-issue.md&title=%5BPAGE+ISSUE%5D+Metadata%20schemas).

## Intro to JSON schemas

The most common format for NFT metadata is [JSON](https://www.json.org/json-en.html), the ubiquitous lightweight format first defined by the JavaScript language. 

Since JSON is a lightweight format, it doesn't impose any constraints on the structure of data within. Unlike XML, there's no built-in schema definition language that can be used to specify a particular "flavor" of JSON for a given use case.

[JSON Schema](https://json-schema.org/) is a standard and a set of tools allowing you to define schemas for JSON objects. These schemas define the names of object properties, as well as what type of values are acceptable for each property. We'll use JSON Schema to show definitions for the most popular metadata standards. If you have trouble reading them, have a look at the official [JSON Schema getting-started guide](https://json-schema.org/learn/getting-started-step-by-step).

## Linking to NFT assets

In our [concept guide to content addressing](../concepts/content-addressing.md), we explain how [IPFS](https://ipfs.io) helps make NFTs resilient to changes over time and protects users from NFTs that are tied to centralized servers and brittle URL conventions.

When linking from your metadata to another digital asset like an image file, we recommend storing the asset on IPFS and using an IPFS [Uniform Resource Identifier](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) (URI) to reference the asset. An IPFS URI is just the string `ipfs://` followed by an IPFS [CID](https://docs.ipfs.io/concepts/content-addressing/), for example: `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi`.

For more information on using IPFS URIs in NFT metadata, see [Best Practices for Storing NFT Data Using IPFS](https://docs.ipfs.io/how-to/best-practices-for-nft-data/) on the IPFS documentation site.

## Ethereum and EVM-compatible chains

This section lists metadata standards for [Ethereum](https://ethereum.org) and compatible blockchains such as the [Binance Smart Chain](https://binance.org).  

::: tip
If you're using [nft.storage](https://nft.storage) to store your NFT assets, you can use the [`store` method](https://ipfs-shipyard.github.io/nft.storage/client/classes/lib.nftstorage.html#store) to add assets and metadata to IPFS in one call, with all the URIs for linked objects handled for you!
:::

### ERC-721

NFTs grew out of the Ethereum community, and the [ERC-721](https://eips.ethereum.org/EIPS/eip-721) proposal was the first formal standard for interoperable NFTs to be widely adopted. Most of the standard is devoted to the smart contract interface that an ERC-721 token must adopt, but there's also a recommendation for a baseline metadata schema:


```json
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents"
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents"
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive."
        }
    }
}
```

This schema is deliberately minimal, and does not cover everything that you might want to put in your NFT metadata. However, because it's a convenient baseline, the ERC-721 schema has been widely adopted and extended by many marketplaces and NFT smart contracts.

Many ERC-721 compatible contracts have adopted the [OpenSea metadata recommendations](https://docs.opensea.io/docs/metadata-standards), which suggest conventions for additional fields that are broadly useful for common types of NFTs.

### ERC-1155

The [ERC-1155](https://eips.ethereum.org/EIPS/eip-1155) multi-token standard extends ERC-721 to support issuing many types of token from the same smart contract. This allows for more efficient creation of distinct token types, which has helped make NFTs practical for gaming use cases.

The ERC-1155 metadata schema is very similar to the one proposed in ERC-721. Since it only adds a few additional properties, tools supporting ERC-721 should support ERC-1155 metadata as well, though they may ignore the extra fields.

```json
{
    "title": "Token Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this token represents"
        },
        "decimals": {
            "type": "integer",
            "description": "The number of decimal places that the token amount should display - e.g. 18, means to divide the token amount by 1000000000000000000 to get its user representation."
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this token represents"
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive."
        },
        "properties": {
            "type": "object",
            "description": "Arbitrary properties. Values may be strings, numbers, object or arrays."
        }
    }
}
```

The most generally useful field is the `properties` object, which allows you to extend the schema with your own arbitrary properties without adding fields to the top-level namespace.

The other additional field, `decimals`, allows ERC-1155 tokens to be either fungible or non-fungible, depending on the developer's needs. For fungible tokens, you can set use the `decimals` field to indicate how to display the quantity of a fungible token in a user interface.

### Deeper & dynamic metadata

As noted, the [OpenSea metadata recommendations](https://docs.opensea.io/docs/metadata-standards) include a number of additional fields that may be useful in your NFT project. For example, take a generative profile picture (often called a “PFP”) where the character has some general attributes (e.g., background color or role definitions) and is equipped with gear (e.g., a hat). This could be modeled as a top-level `attributes` field within the NFT metadata schema in the following way:

```json
...
"attributes": [
	{
		"trait_type": "Background",
		"value": "Green"
	},
	{
		"trait_type": "Head",
		"value": "Hat"
	},
	{
    "trait_type": "Level",
    "display_type": "number", 
    "value": 10
  }
	...
]
...
```

Great, now your PFP NFT has deeper metadata! This information is often displayed on marketplaces, like OpenSea, to help end users understand what their NFT is comprised of — and for utility purposes as well (e.g., an in-game NFT where a character’s level affects game behavior). 

When you initially mint an NFT, there’s an on-chain field called `tokenURI`, which points to your metadata’s CID — this is where marketplaces look to when reading all of the information pertaining to an NFT’s metadata. The default `ERC721` contract does this by taking the `baseURI` of the contract and automatically concatenates it with the token’s ID when `tokenURI` is called. For instance, if you were to upload a directory of metadata files, it would look something like this, where the entire parent folder houses each metadata file that corresponds to a token ID:

```bash
nft_metadata_directory  # will be represented by a CID after uploading to IFPS
├── 1  # ERC-721 metadata-compliant JSON files
├── 2  # where each number represents the NFT's `tokenId`
└── 3 
...
```

Once this folder is uploaded to the IPFS network, the proper CIDs are created such that the parent directory is at some CID (stored as the `baseURI`), and each metadata file can be accessed like a standard file path (e.g., `baseURI/tokenId` could look like `bafybeihxyqfz4u3hkkxo67sqb4no3hc4qvcuuk4niw4tia2ong2koz5tmq/1`).

But, what if you want to change, or *mutate*, the metadata itself, making it *dynamic*? Recall that CIDs are *unique* and *immutable*; once a file/folder is uploaded, you cannot change the underlying data without changing the CID. For example, if you wanted to alter the `trait_type` **of `Background` from `Green` to `Red`, the CID would change. And since the on-chain `tokenURI` points to the metadata’s CID, you would have to try and change that on-chain CID, which might not be possible without the proper planning.

So, how can you make an NFT dynamic? Here are a few options, each with certain tradeoffs:

1. Host the metadata on a centralized server
    1. Some people will end up hosting metadata on their own server but continue to host the actual files (e.g., an image) using IPFS/Filecoin. It’s a hybrid approach that allows the metadata to be easily changed without altering the on-chain data.
    2. Unfortunately, this creates a number of issues as it follows “web2” principles and isn’t openly accessible nor content addressed like in IPFS/Filecoin; thus, this design should not be used.
2. Host the metadata on-chain
    1. If you can define *all of your metadata changes* when you initially mint (or later upgrade) the NFTs, then you can programmatically point to on-chain metadata. 
    2. The obvious drawback is you’d have to know all of the possible metadata mutations that could take place, plus, again, the cost factor; it’s [very expensive](https://www.larvalabs.com/blog/2021-8-18-18-0/on-chain-cryptopunks) to post this data on-chain. Projects that go down this path may choose to do so as a final “freezing” of the metadata on-chain, but it removes flexibility on any subsequent metadata changes and is only realistic for a subset of use cases.
3. Design your contract to allow for `tokenURI` changes
    1. For example, inherit from [`ERC721URIStorage`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage) and/or implement it’s functionality for updating the `tokenURI`. The standard [`ERC721`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721) contract’s `tokenURI` method simply returns the `baseURI/tokenId`, but `ERC721URIStorage` allows for a URI to be stored on-chain and would store a CID instead.
    2. Namely, this NFT extension allows the `tokenURI` to be altered by certain actors (e.g., contract’s owner) after the NFT is minted by using the [`_setTokenURI`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage-_setTokenURI-uint256-string-) method. For every metadata changing action (e.g., user wants to alter a PFP background color), this would have to trigger a new metadata file to be uploaded using [nft.storage](http://nft.storage). The existing metadata CID, defined in `tokenURI` within the contract, would then need to be overwritten using a method that calls [`_setTokenURI`](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage-_setTokenURI-uint256-string-) with the corresponding NFT’s `tokenId` and the new metadata CID.
    3. However, this is not only adds complexity but can also be rather expensive because changing on-chain data requires users to pay gas fees, which isn’t scaleable for NFTs that dynamically change often. For instance, imagine requiring a user to pay gas fees just to change the background color of a PFP, purely for aesthetic purposes? That isn’t ideal.
4. Augment [nft.storage](http://nft.storage) with additional tools that add a layer of indexing and querying *to the metadata,* thereby, enabling dynamism and composability of your NFT assets.
    1. This solution is more efficient than on-chain solutions and works *with* decentralized storage providers, like [nft.storage](http://nft.storage), for the assets themselves, ensuring the benefits of decentralized storage remain intact. For example, [Tableland](https://tableland.xyz) offers a structured relational data solution that can index off-chain data & state (e.g., pointers to a JPEG’s CID) as rows & columns and bring them to on-chain assets (using SQL & gateways). Namely, it enables relational, dynamic metadata while also helping add composability & query-ability to any NFT project.
    2. Similar to the above, this approach also comes with nominal gas fees when changing table states (e.g., when updating attributes of an NFT) on EVM-compatible L1/L2s. Plus, the ability to leverage L2s allows for a very efficient solution that provides a new level of dynamism, composability, and access control.