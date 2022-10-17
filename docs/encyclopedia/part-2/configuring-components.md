# Configuring Components

*Things to think about when setting up a smart contract and minting tokens*

## Smart contract permanence

For the most part, a smart contract can’t be changed once it has been deployed on the blockchain. This is why it is important to either use a test network like Goerli or a no-code editor to preview what you’ve made before it goes live. Pay special attention to the name of the contract and the token symbol to make sure they are exactly what you want them to be. If you make a mistake or need to change something about the contract, you’ll likely have to re-deploy it completely (which can be difficult if people have already bought or collected NFTs created on it). You could theoretically migrate contracts or create additional contracts that connect to the main one in the future, but these things can create many issues and may require planning far in advance.

## Metadata flexibility

Unlike smart contracts, the metadata of NFTs can typically be updated after the fact relatively easily… but not without a cost. To update things, you’d likely have to submit additional blockchain transactions that would have varying financial costs associated with them. Still, this ability is helpful in situations where there may have been an error in the artwork or a typo in the description. It’s especially helpful because it allows for projects to be mutable, interactive, and more dynamic.

On the other hand, the fact that metadata can be updated also means that there is an inherent level of trust involved between an NFT creator and an NFT collector. In the world of NFTs there is a concept called “rugging” where a project creator will change an NFT’s artwork to be something different than what was promised before then runing away never to be heard from again. For a variety of reasons, it’s important for creators to be upfront and honest with potential collectors so that trust can be established.

## Licenses & copyright

Contrary to popular belief, a smart contract or an NFT does not grant a usage license or copyright ownership from a legal perspective. Just because you own an NFT, doesn’t mean you also can use the artwork however you want. While not necessary, it can be a good idea as a creator to have an informational page on your website that provides the terms of the agreement so that collectors aren’t left wondering. This can be a totally separate thing apart from the NFT or the smart contract itself though.

## Data storage & preservation

If you plan to store the data and media files associated with your NFT somewhere off-chain (the place most NFTs store their data), then you’ll need a decentralized storage provider that is secure, trustworthy, and who can handle the unique needs of NFTs. This is where [NFT.storage](http://NFT.storage) comes in! Through the power of IPFS, Filecoin, and content addressing, NFT.storage has already been used to store over 80 million NFTs and 200 terabytes of data. The best part of all is that it’s a public good and is completely free. 

When you’re ready begin storing NFT data and making use of all the information you’ve learned about in this guide, you can get started over on [NFT.storage](http://NFT.storage).
