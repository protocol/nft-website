---
title: NFT basics
description: Learn the basics of NFTs in this developer-focused guide - what they are, why they are important, and how they are shaping the future of the arts, games, collectibles, and more.
---
 # NFT basics

**NFT** stands for _non-fungible token_, which doesn't explain very much. This page defines what an NFT actually is in the abstract, while also looking at a few specific examples of NFT applications and use cases.

First, let's break down the name. Before we get into "non-fungible," what do we mean by "token"? For our purposes, a token is a kind of record in an information system called a blockchain. We won't get into all the details of how blockchains work here. To understand what an NFT is, we just need a bit of background knowledge.

## A bit of history

The most famous blockchain is the one that coined the term. Bitcoin's [whitepaper](https://bitcoin.org/bitcoin.pdf) introduced a "chain of blocks" to track and secure the history of the system over time, and the term "blockchain" caught on as new networks built on the idea. The Bitcoin network has a single token, named "Bitcoin." 

Like traditional cash, Bitcoin is _fungible_, meaning you can replace one Bitcoin with another Bitcoin without changing the value of either. In fact, at a technical level, there's not really such a thing as "a single Bitcoin" with its own identity. Whereas cash at least might have a serial number to distinguish one bill from another, the Bitcoin network doesn't track coins individually and assign them each an identifier. Instead, the system just keeps track of the quantity in each account, crediting one account and debiting another with each transaction.

Bitcoin inspired a host of other blockchains that iterated on the same basic idea and introduced new capabilities. The most significant for NFTs was Ethereum, where the concept of NFTs was first developed. Ethereum added general-purpose computation to the blockchain consensus model pioneered by Bitcoin, positioning itself as a "world computer" enabling "programmable money." 

Ethereum has a native token called Ether, which is used as both a store of value and to pay for computation in the form of fees called _gas_. Like Bitcoin, Ether is fungible. However, the smart contract computation model allows developers to create their own tokens, which can have special properties according to the logic in the contract. 

Most early smart contracts defined fungible tokens similar to Ether, but people quickly began experimenting with using tokens to contain data, making each token unique and distinguishable from the rest. The result is a token that can't easily be exchanged with another arbitrary token of the same type, or a _non-fungible token_. 

## What makes a token non-fungible?

Earlier we mentioned serial numbers as a way to distinguish one dollar bill from another. Even though you can tell them apart, two dollar bills are still fungible because they each have the same value as currency. A unique identifier alone is not enough to make something non-fungible.

However, a dollar bill that's been sketched on by Picasso is unique in a way that has nothing to do with serial numbers. By using it as a medium for artwork, our imaginary Picasso has made the bill less fungible. While you could technically redeem it for a dollar's worth of snacks, the exchange value of the bill is now far greater than one dollar.

In the same way, by allowing each token to contain a small amount of arbitrary data, NFTs become a medium for creative expression, as well as a unit of exchange and account. The value of an NFT is thus highly dependent on the data it contains and represents. The same NFT may be valued completely differently by different people, based on factors like aesthetic taste or the identity of the creator.

Of course, there's a good reason we don't conduct business by swapping priceless Picasso sketches around! Without fungibility, an NFT isn't much good as currency. However, by existing on the same networks that enable digital currency, NFTs can leverage the payment and account infrastructure for transactions and benefit from the security guarantees of the blockchain.

## How are NFTs special?

What makes an NFT different from an animated GIF file on someone's website, or from other kinds of digital records like a spreadsheet?

The differences hinge on a few core properties of the blockchain design. The primary function of a blockchain network is to get all the participants to agree on a single shared "state of the world". For Bitcoin, the shared state is the balance of every account, while for Ethereum, that shared state is the inputs and outputs of smart-contract interactions. Because the members of the network are spread out across the world, it takes time for everyone to converge on the same state, and there are special rules to prevent cheating or malicious behavior. Once everyone has agreed on the state, it becomes part of the canonical history of the blockchain.

As new blocks are added to the chain, earlier blocks become harder and more expensive to modify. Soon — generally within a few blocks — the cost to "change history" becomes so great that it is effectively impossible, and the information recorded in the blockchain can be considered permanent.

By contrast, the traditional web is famously impermanent and dynamic. A web server may serve different content based on, for example, the time of day or the geolocation of the visitor's IP address. And as anyone who's been frustrated by an outdated link can testify, content disappears from the web nearly as often as it arrives. 

This property of permanence and stability is central to the NFT value proposition. By using a blockchain as a durable shared data storage medium, NFTs can be trusted to endure as long as the blockchain itself remains operational — which brings up another interesting property of blockchains. By rewarding node operators with cryptocurrency in exchange for keeping the network alive, a blockchain incentivizes its own survival. As long as there are people attracted to the economic reward, there will be someone motivated to keep the network online. This ensures the survival of all historical data, including NFTs.

::: tip IMPORTANT
As we'll see in our discussion of [content persistence](content-persistence.md), a blockchain isn't always enough to keep your NFTs alive forever. NFTs often link to data outside the blockchain, which also needs to be kept online.
:::

## What are NFTs used for?

Among the earliest NFT experiments is [CryptoPunks](https://www.larvalabs.com/cryptopunks), a set of 10,000 pixel art characters that can be collected and traded on Ethereum. Although anyone can view the artwork for any punk, each character can only have a single official "owner" on the Ethereum blockchain at a given time. CryptoPunks proved to be a huge success, with rare punks trading hands for huge sums of Ether worth millions of US dollars.

Digital collectibles like CryptoPunks remain one of the most popular and compelling use cases for NFTs, and the successors to CryptoPunks helped define the earliest [standards for interoperability and metadata](../reference/metadata-schemas.md) for NFTs.

In the years since CryptoPunks debuted, NFTs have become a vehicle for all kinds of creative projects. Much of the excitement has come from artists looking to engage directly with fans and find new ways to make a living from their creations. This has been supported by a growing ecosystem of [NFT marketplaces](../reference/nft-marketplaces.md) that bridge the gap between the familiar web and the cryptic world of crytocurrencies, and has also resulted in millions of dollars' worth of direct payments to artists for their digital creations.

Outside digital art and collectibles, NFTs have found use cases in gaming, where they can represent plots of virtual land, avatars and skins for game characters, in-game items, and more. By putting a player's "inventory" of these items on a shared blockchain, NFT-powered games can enable new mechanics and allow players to use their custom items across multiple potential games and experiences. They also give players a way to buy, sell, and trade items among themselves without locking their purchases into a single company's storefront or marketplace.

## Looking ahead

We are still in the early days of NFTs, and it's very likely that we'll see a new crop of interesting NFT use cases and experiences that are outside of anything being done today. It's hard to predict what the future will bring, but if you're here at NFT School you have a better chance than most. As they say, the best way to predict the future is to invent it yourself!
