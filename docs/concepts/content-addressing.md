---
title: Content addressing
description: Understand how content addressing is key to NFT best practices in this developer-focused guide.
---

# Content addressing

_Content addressing_ is a technique for organizing and locating data in an information system in which the key used to locate content is derived from the content itself. In this concept guide, we'll describe how content addressing works and why it's important for NFTs.

## The basic problem

Imagine a key-value store with an interface like the one below:

```typescript
// This example uses TypeScript to annotate the parameters and return types of our methods.
// We won't do any fancy type manipulation, though, so don't worry if you're not into TypeScript.
type Key = string;
type Value = string;

interface KVStore {
  put(key: Key, value: Value): Promise<Void>;

  get(key: Key): Promise<Value>;
}
```

This basic interface is pretty common for key-value stores. Using `put`, we can associate any `Value` with a `Key`, and later when we need it, we can look the key up with `get` and hopefully get our value back.

When you start to use an interface like this, one of the most important decisions is what to use for the keys. If you're building an application where you control the access patterns, you can use whatever keys you like and keep track of them all in your code, or come up with some rules to map out which keys should be used for which kind of data.

Things get more complicated when many uncoordinated parties are all writing to the store at once. With one global key space, either everybody needs to agree on the same rules, or the space needs to be split into many "domains" or "namespaces."

Let's say we have one big key-value store that's shared by thousands or even millions of people, each with their own domain in the key space. That mostly solves the writing problem — everybody can manage their keys without needing to coordinate with everyone else.

However, now it's less clear where to look for data when we want to `get` it out again. With each domain following its own rules, it's hard to know what key to use to retrieve things. Also, without coordination between the different domains, you may end up with the same value stored multiple times in different domains, with no easy way to tell that many keys are all pointing to the same value.

If this sounds familiar, consider what happens when you resolve a link like `nftschool.dev/concepts/content-addressing`. First, your operating system will query a global shared key-value store, split into many domains: the Domain Name System (DNS). The DNS will return an IP address that your network card can use to send HTTP requests over the network, where this site's naming conventions turn the key `/concepts/content-addressing` into a response payload.

The web is basically the definition of "internet scale," so clearly this system works pretty well. So, what's the problem?

The real problem is time.

Both components of an address like `nftschool.dev/concepts/content-addressing` are _mutable_, meaning they can change over time. If we forget to pay our bills, the domain can expire and be bought by the highest bidder. Or, if we decide to play fast and loose with our site structure and forget to add redirects, the path `/concepts/content-addressing` might return a 404 error instead of this concept guide.

In the context of the web, where _everything_ is mutable and dynamic, this is just the way it's always been. The web has never promised any kind of permanence, either in content or in the "meta-structure" of links between content. As a result, [link rot](https://en.wikipedia-on-ipfs.org/wiki/Link_rot) is just something we've all learned to live with.

But for a digital artifact that's meant to actually be permanent, like an NFT, link rot is an existential concern. Link rot affects NFTs because most NFTs are actually just links. Data storage on most blockchain networks is much, much more expensive than traditional online storage systems. For example, in May 2021 the cost to store one megabyte of data directly on Ethereum was approximately 21.5 Ether (ETH) according to [gas prices](https://ethgasstation.info) — and at the time, this worked out to about $56,000 USD.

To make NFTs representing digital art financially practical, the artwork itself needs to be stored "off-chain" where storage costs are manageable, while limiting "on-chain" storage to as little as possible. The simplest way to do this is by storing only the link to the off-chain data inside the NFT itself. However, the permanence of the blockchain only applies to on-chain data. If you store an NFT with a link that later rots, the value of the NFT is compromised even though the blockchain record remains unchanged.

## A stronger link

To safely link from an NFT to off-chain assets like images and metadata, we need links that can stand up to the onslaught of time. The ideal link would always resolve to the same piece of content that was originally referenced in the permanent blockchain record, and it would not be tied to a single server owner or "domain."

Content addressing gives us exactly the kind of links we need. A content-addressed system works just like our key-value store, with one significant difference: You no longer get to choose the keys. Instead, the keys are derived directly from the values that are stored using a deterministic function that will always generate the same key for the same content.

Now our interface from earlier looks like this:

```typescript
interface ContentStore {
  put(value: Value): Promise<Key>;
  get(key: Key): Promise<Value>;
}
```

Instead of accepting a key and a value, our `put` method just takes a value and returns the key to the caller. In exchange for not being able to choose your own keys, you get some valuable properties.

First, we no longer need to coordinate among multiple writers to our store by splitting the key space into domains. There's now one universal domain — the domain of all possible values. If multiple people add the same value, there's no collision in the key space. They just each get the same key back from the `put` method.

This change also gives our values _location independence_. In our original key-value store with multiple domains, we had to include the domain inside the key to prevent name collisions. To retrieve a value, you needed to know which domain it belonged to, as well as the specific location within that domain's piece of the key space. If we store a _location-based_ key on the blockchain, our ability to retrieve the data depends on the one domain that's baked in to our key. Even if the same content is stored in a thousand other domains, our lookup will fail if the one we depend on disappears or changes its naming conventions.

## How to use content addressing

So far, we've been talking about content addressing in the abstract, but the point of NFT School is to build things! How can we actually leverage content addressing to make NFTs with durable links?

The simplest way is to use [IPFS](https://ipfs.io), the InterPlanetary File System. When your data is stored on IPFS, users can fetch it from any IPFS node that has a copy, which can make data transfers more efficient and reduce the load on any single server. As each user fetches a piece of data, they keep a local copy around to help other users who might request it later.

To use IPFS with your NFTs, try [nft.storage](https://nft.storage/). It makes it easy to get your data onto IPFS, as well as providing long-term persistence backed by the decentralized [Filecoin](https://filecoin.io/) storage network. To help foster the growth of the NFT ecosystem and preserve the new digital commons of cultural artifacts that NFTs represent, nft.storage provides free storage and bandwidth for public NFT data. [Sign up for a free account](https://nft.storage/login/) and try it out!

## More resources

For more information, try the following:

- [Official nft.storage documentation](https://nft.storage/#docs)
- [Best practices for storing NFT data using IPFS](https://docs.ipfs.io/how-to/best-practices-for-nft-data/)
- [ProtoSchool lesson on content addressing](https://proto.school/content-addressing/)

