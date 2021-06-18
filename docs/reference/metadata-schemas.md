---
title: Metadata schemas
description: A helpful, handy guide to metadata schemas for NFT developers.
---
 # Metadata schemas

As described in the [NFT basics concept guide](/concepts/non-fungible-tokens.md), an NFT is a digital asset that can be bought and sold on a blockchain network. The value of an NFT is based on what it _represents_ — for example, an image, video, or game asset. To make an NFT represent something, we use _metadata_.

[Metadata](https://wikipedia.org/wiki/Metadata) is data that provides information about other data; in the case of an NFT, it describes that NFT's essential properties, including its name, description, and anything else its creator feels is important. In many cases, an NFT's metadata also contains links to the images and other "primary" digital assets that give an NFT its value.

Because [NFT marketplaces](/reference/nft-marketplaces.md) leverage metadata to display NFTs to buyers and sellers, it's important for that metadata to be in a format that marketplaces can understand. To make your NFTs compatible with as much of the ecosystem of marketplaces, wallets, and other NFT tooling as possible, you should adopt an existing metadata standard, and if need be, extend it with your specific needs.

This reference guide shows some of the most common and useful metadata formats used by NFTs today. If your favorite standard isn't included, please [open an issue](https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=open-an-issue.md&title=%5BPAGE+ISSUE%5D+Metadata%20schemas).

## Intro to JSON schemas

The most common format for NFT metadata is [JSON](https://www.json.org/json-en.html), the ubiquitous lightweight format first defined by the JavaScript language. 

Since JSON is a lightweight format, it doesn't impose any constraints on the structure of data within. Unlike XML, there's no built-in schema definition language that can be used to specify a particular "flavor" of JSON for a given use case.

[JSON Schema](https://json-schema.org/) is a standard and a set of tools allowing you to define schemas for JSON objects. These schemas define the names of object properties, as well as what type of values are acceptable for each property. We'll use JSON Schema to show definitions for the most popular metadata standards. If you have trouble reading them, have a look at the official [JSON Schema getting-started guide](https://json-schema.org/learn/getting-started-step-by-step).

## Linking to NFT assets

In our [concept guide to content addressing](/concepts/content-addressing.md), we explain how [IPFS](https://ipfs.io) helps make NFTs resilient to changes over time and protects users from NFTs that are tied to centralized servers and brittle URL conventions.

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
