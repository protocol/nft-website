---
title: Mutable NFTs
description: Understand how to create and manage NFTs that can safely change over time.
---

# **Guide to Mutable NFTs**

Original use cases for NFTs, such as collectibles, relied on the immutability of NFT images and metadata to preserve rarity, a key element in establishing the value of these tokens. Using IPFS’s cryptographic hashes (CIDs), you can create tamper-proof NFTs.

However, many assets evolve over time – both in real life and in digital realms. An NFT athlete’s team name might change if they get traded. An NFT vaccination record might change as new doses are delivered. A game character NFT might evolve and grow as they triumph in new adventures, becoming stronger and more valuable.

Today, these updates are frequently made by migrating the NFT to a new contract that points to the new asset (often a new image or JSON file). This is expensive and slow, requiring new gas fees and block confirmations each time. Moreover, any design that allows a 3rd party to update the NFT also opens the door to rug pulls or security violations.

This guide walks through several ways to securely create and manage NFTs that change over time, also known as mutable NFTs.

## Background

### Metadata Standards

Before diving in, check out the overview of [metadata standards](https://nftschool.dev/reference/metadata-schemas) -- since every NFT needs to comply with ERC-721 metadata standards, it's important to understand what this entails. In particular, the section on [deeper & dynamic metadata](https://nftschool.dev/reference/metadata-schemas/#ethereum-and-evm-compatible-chains) walks through the current state of how people achieve mutable NFTs:

1. Centralized hosting (not composable)
2. On-chain (expensive to mutate)
3. `tokenURI` changes that point to different IPFS CIDs (requires predefined knowledge of the NFT's end state)
4. Leverage web3 native solutions, like [Tableland](https://tableland.xyz/), which is augmented by IPFS or other related data services (see details below).

### IPFS Naming Services ("IPNS")

As an alternative to point #3 above, developers can also leverage IPNS. Recall that IPFS creates immutable links (also known as content identifiers) based on a cryptographic hash of your data. This design is great for verifying that your data is correct, but once you’ve shared that CID with the world, what happens if you need to fix a typo? Or make a bigger change?

Naming services provide a way to map a consistent name to a changing address. That means that you can point to content in IPFS that may change, and people can still access it without needing to know the new hash beforehand. It’s perfect for pointing to the evolving assets of a mutable NFT. Naming services designed for IPFS include [IPNS](https://docs.ipfs.io/concepts/ipns/), [w3name](https://github.com/web3-storage/web3.storage/tree/main/packages/client#mutability), and [DNSLink](https://docs.ipfs.io/concepts/dnslink/).

(You can also read about [DNS and Ethereum-based naming services](https://medium.com/tokendaily/handshake-ens-and-decentralized-naming-services-explained-2e69a1ca1313).)

## Approach 1: NFT.storage + W3name

This approach uses NFT.storage, but uses an [Interplanetary Naming System](https://docs.ipfs.io/concepts/ipns/) (IPNS) address instead of the CID in your smart contract. This IPNS address points to a CID, and is associated with a public-private keypair. The pointer can be trustlessly updated to a new CID using the private key.

[w3name](https://github.com/web3-storage/web3.storage/tree/main/packages/client#mutability) is an IPNS service and client library that adds a few developer-friendly optimizations. First, [default IPNS](https://docs.ipfs.io/concepts/ipns/#example-ipns-setup-with-cli) records must be republished every 24 hours to be available on the public IPFS DHT. w3name re-publishes automatically, so your app only needs to publish once. Second, it comes with an HTTP API to get the latest update to an IPNS address, which is simpler than getting this from the public DHT.

In this approach, you [store your data on NFT.storage](https://nft.storage/docs/client/js/#storing-data) following the normal steps. Then, [create an additional w3name key](https://github.com/web3-storage/web3.storage/tree/main/packages/client#mutability) that points to the NFT.storage CID. In your smart contract, use the w3name key in your smart contract (instead of the NFT.storage CID). To update the NFT, [upload new assets to NFT.storage](https://nft.storage/docs/client/js/#storing-data) and update the w3name key to point to the new CID.

Note that w3name is currently bundled into the [web3.storage](https://www.npmjs.com/package/web3.storage) npm package. It will be moved out to a separate library in the future, but any keys you’ve created will stay the same.

For questions and discussion, file an issue on [Github](https://github.com/web3-storage/web3.storage/issues) or join the #web3storage channel on the Filecoin Discord.

## Approach 2: Ceramic streams

[Ceramic](https://ceramic.network/) is an IPFS-based system for decentralized data streams. A Ceramic stream consists of an append-only log of commits where updates are signed by a decentralized identifier (DID), validated against a set of state transition rules, then anchored on a blockchain. 

With this approach, each NFT would get a new stream and a stream identifier (streamID). StreamIDs are a type of uniform resource locator (URI) formatted like `ceramic://kjzl6fddub9hxf2q312a5qjt9ra3oyzb7lthsrtwhne0wu54iuvj852bw9wxfvs`). The smart contract would be created as normal, using the streamID to represent your asset.

Updating the NFT metadata is as simple as writing new data to the stream. To render or use the NFT, you would fetch the streamID and process the commit log to get the latest state of the asset. As of now, Ceramic supports JSON data, so this would be a good way to manage mutable NFT properties and metadata as opposed to editable images or video. This approach might be best suited for NFTs that must be updated extremely frequently.

## Approach 3: The Best of Both Worlds

[Tableland](https://tableland.xyz/) is a permissionless, serverless database. It extends blockchains to add native SQL functionality and mutable data while leveraging the same old Solidity with smart contracts + SQL as well as an SDK for client-side developers, and it works extremely well with the approaches outlined above. The protocol makes it extremely easy to create tables that store:

- Descriptive metadata related to the IPFS, IPNS, or Ceramic identifiers (e.g., what is the file, date created, creator, etc.).
- _Mutable_ pointers to these solutions (e.g., update a cell from IPFS to IPNS to Ceramic).
- Use access controls for who can mutate the data, all with on-chain data (i.e., only allow a wallet / account with ownership of NFT ABC to mutate a value).
- Other related table data can be composed via SQL -- the off-chain Tableland network provides a gateway to make this easily accessbile to NFT marketplaces.

This provides a number of unique advantages. Instead of storing a hardcoded IPFS, IPNS, or Ceramic stream identifier at the `tokenURI`, you can store a pointer to the Tableland gateway. The response from this endpoint could inclue IPFS (or other) identifiers and is ERC-721 compliant, allowing developers to pick and choose which table data is exposed in the ERC-721 metadata. A simple example is provided [here](https://testnet.tableland.network/query?mode=list&s=select%20json_object('name'%2C'Rig%20%23'%7C%7Cid%2C'external_url'%2C'https%3A%2F%2Ftableland.xyz%2Frigs%2F'%7C%7Cid%2C'image'%2Cimage%2C'image_alpha'%2Cimage_alpha%2C'thumb'%2Cthumb%2C'thumb_alpha'%2Cthumb_alpha%2C'attributes'%2Cjson_group_array(json_object('display_type'%2Cdisplay_type%2C'trait_type'%2Ctrait_type%2C'value'%2Cvalue)))%20from%20rigs_5_28%20join%20rig_attributes_5_27%20on%20rigs_5_28.id%3Drig_attributes_5_27.rig_id%20where%20id%3D1%20group%20by%20id%3B). Namely, developers can choose compose data across multiple web3-native SQL tables into a single object that is read by NFT marketplaces, including the IPFS-hosted image CID as part of the response. Simply create tables at the [Tableland registry smart contract](https://docs.tableland.xyz/deployed-contracts) (or use the [SDK](https://docs.tableland.xyz/javascript-sdk)), and write SQL directly in smart contracts or the URL! If you know SQL (which is one of the easiest languages to pick up), you know how to use Tableland.
## Next Steps

Once you've considered these essential design decisions, you'll be better prepared to start building and testing your app — and releasing it to your users! If you come across any additional tips or tricks you find to be particularly helpful along your build journey, you're invited to share it here on NFT School to make building NFT dApps simpler and quicker for the developer community at large. Just [propose edits to this page on GitHub](https://github.com/protocol/nft-website/blob/main/docs/tutorial/mutable-nfts.md) or even write or [suggest new content](https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=content-or-feature-suggestion.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29) — your fellow developers will thank you!
