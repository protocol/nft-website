---
title: Metadata schemas
description: A helpful, handy guide to metadata schemas for NFT developers.
---
 # Metadata schemas

This page aims to be a comprehensive guide to the metadata schemas and best practices used in various NFT platforms and use cases.

**We're still developing this page, so we're not quite as comprehensive as we'd like yet. Please [check the status of this page](https://github.com/protocol/nft-website/issues/44) and suggest improvements!**

## Ethereum and EVM-compatible chains

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
