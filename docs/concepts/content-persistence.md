---
title: Content persistence
description: Learn the basics of content persistence and how decentralized storage and pinning services fit into the NFT developer lifecycle.
---
# Content persistence

Broadly speaking, today's web browsing operates through what is known as _location addressing_. Location addressing retrieves online information from specific locations on the web ─ i.e. from behind URLs. However, this has its obvious downsides. Location addressing is centralized; whoever controls that location controls the content. And anything behind a location-addressed URL can be changed. The language of an article, the colors of a digital artwork, or the properties of a recorded identity. Location-addressed URLs are exploitable.

The solution is [_content addressing_](./content-addressing.md). Content-based addressing allows you to access data based on a unique fingerprint of that piece of data; no matter where it is stored, if you have that unique fingerprint of the data, you should be able to retrieve the content. In content-based addressing (within the context of IPFS), content is no longer retrieved from single locations on the web. Rather, content is retrieved from any participating nodes on the IPFS network that have the content you're requesting. Pieces of content are shared by many parties, and content can always be retrieved either entirely from one node or collected in bits and pieces from multiple nodes.

Content addressing, however, is only part of the solution. Just because information can be retrieved through IPFS no matter where it is stored, doesn't mean it is guaranteed to be around forever. To have a complete solution, content persistence is key.

## The value of content persistence

Once the retrieval of online content is reoriented around content-based addressing, the question becomes: how do we ensure the content continues to be available throughout time? In other words, how do we make sure the content persists? Without content that is reliably stored over time, similar issues of today emerge, with a fragmented, incomplete, and amnesic Web.

As with most solutions around data and information, there are centralized and decentralized options. The centralized option would be to go with a service that promises to always store the content in their servers. Centralized storage, however, doesn't achieve true persistence, as it is subject to a single centralized point of failure.

Decentralized content persistence is the only way to ensure that content remains available over time. By ensuring that completely separate, interoperable nodes are all storing data that is backed by strong cryptographic guarantees, information is protected from becoming unavailable due to the actions (or inaction) of any central service. The question becomes: how? Filecoin is building the foundation for content persistence, as well as a set of tools and services on top to aid in that mission.

## Filecoin for content persistence

Filecoin is the incentivization layer built to complement IPFS' solution to content addressing by providing content persistence. IPFS ensures that content cannot change over time without a clear record and solves the issue of URLs not resolving. Filecoin ensures that content-based addressing remains resilient over time by making sure that the content that is being retrieved keeps being available.

Filecoin achieves this mission through [novel cryptography, consensus protocols, and game-theoretic incentives](https://filecoin.io/blog/posts/filecoin-features-verifiable-storage/), providing true decentralized storage. At the heart of it all is Filecoin's unique approach to storage verification.

Filecoin's storage verification system solves a previously intractable problem for decentralized storage: How can storage providers _prove_ that they are really storing the data they say they are through time and that they are dedicating unique physical space for it?

In a centralized storage service, you have to place your trust in well-known companies that guarantee the integrity and security of their systems. On the Filecoin network, anyone in the world can offer storage space. But to maintain trust on a decentralized network like Filecoin, you need a way to establish trust in the global network itself.

To verify storage on Filecoin's decentralized network, you need to prove two things. First, you need to prove that the right set of data is stored in a given storage space. Second, you need to prove that the same set of data has been stored continuously over a given period of time.

Filecoin's [proving algorithms](https://filecoin.io/blog/posts/what-sets-us-apart-filecoin-s-proof-system/) perform these verification tasks. _Proof-of-Replication_ proves that a given storage provider is storing a physically unique copy of a client's original data, while _Proof-of-Spacetime_ proves that the client's data is stored continuously over time.

In addition to its proof system, the Filecoin network also relies on game-theoretic incentives to discourage malicious or negligent activity. All storage providers that agree to store data on the Filecoin network must provide collateral in the form of Filecoin tokens at the time of agreement. Any storage provider that fails Proof-of-Spacetime checks is penalized, loses a portion of the collateral and is eventually prevented from offering storage again to clients.

Filecoin has baked content persistence into its core mission to "store humanity's most important information." And it is well on its way to achieving that mission. To date, the network [supports multiple Exbibytes of storage](https://filfox.info/en).

## Content addressing and persistence in action: NFTs

Today, one of the fastest growing types of content in the crypto space is NFTs. However, NFTs have been the subject of scrutiny for matters of availability and permanence, all of which boil down to the concepts of content addressing and persistence. When an NFT is minted and traded, what is actually being talked about is the record of the (for example) artwork. The content and the metadata of that artwork (the colors, shapes, sounds, etc.) do not automatically live on the blockchain. "Content" refers to the image itself. "Metadata" refers to the descriptive text, artist information, CID of the actual content, and more. This exposes many NFTs to issues of addressing and persistence, if that content and metadata of the NFT are not stored reliably. Using IPFS to solve the addressing concern of NFTs is quickly becoming the norm, and a large and growing ecosystem of pinning services ensures availability of all the IPFS data.

Protocol Labs recently launched [nft.storage](https://nft.storage/) to make handling content addressing and persistence as easy as possible, specifically for NFTs. nft.storage allows anyone to generate the metadata for minting and storing their NFTs on Filecoin for free, with nothing more than a few lines of code. Developers register for an account, generate an API access key, and can use a simple client library to generate metadata and permanently store their NFTs.

NFTs stored via nft.storage are not only available via the IPFS network, they are also protected from disappearing by Filecoin, which incentivizes storage providers around the world to continue storing the NFT content and metadata long-term.

![Diagram of storage network](./images/content-persistence/diagram-storage-network.png)

## Evolving network participants in content persistence

Right now, agreements to keep content stored over time are economic relationships between individuals and the nodes that keep the content online. The model has proven immensely sustainable for the Filecoin ecosystem. However, the ecosystem is also preparing for greater numbers of people who want to store their information online, and create solutions to accommodate more decentralized needs of ownership and payment. By providing storage for developers of NFT applications, nft.storage is on the frontlines of that role, encouraging NFT best practices by making them as easy as possible to implement and by removing the economic consideration from creators and collectors.

A wave of other ecosystem partners will continue to emerge to incentivize the persistence of vital data by adopting different economic roles within the IPFS and Filecoin ecosystem. These ecosystem partners will make the basic relationship between individual and storage providers more varied, flexible, and sustainable. [DataDAOs](https://filecoin.io/blog/posts/the-future-of-datadaos/) are on the horizon and well-positioned to shape the evolution of data storage and payment on distributed systems. The term describes a DAO (Decentralized Autonomous Organization) dedicated to the storage, maintenance, processing, and (possibly) licensing of potentially massive datasets. By shouldering the technical and financial responsibility of storing the datasets, dataDAOs can effectively monetize critical data while remaining true to a broader commitment to decentralized content persistence. Other ecosystem partners, like [Ocean Protocol](https://oceanprotocol.com/) and [Filehive](https://filecoin.io/blog/posts/decentralized-data-markets-with-filehive/), do not operate as DAOs, but play a similar role as ecosystem partners that rely on Filecoin to maintain the data they are monetizing and licensing to others.

## Conclusion

The internet today, though immensely powerful, has long exposed critical weaknesses in the way it stores and maintains data. Content addressing and persistence are at the root of this issue; specifically, centralized content addressing and persistence. Only through decentralized, verifiable solutions can we ensure that our online information remains secure and available indefinitely. Together, IPFS and Filecoin solve the issues of addressing and persistence, exemplified most recently by nft.storage — a solution that demonstrates an elegant technical stack and a sustainable economic model.
