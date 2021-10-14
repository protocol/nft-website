---
title: Designing a minting app
description: Explore the problem space of minting NFTs in this high-level architectural overview.

---
 # Designing a minting app

 Our [minting service tutorial](../../tutorial/minting-service.md) shows how to create a simple web app that mints NFTs on Ethereum, building on a great open-source starter repository called [scaffold-eth](https://github.com/austintgriffith/scaffold-eth).

 In this guide, we'll take a slightly different approach: To help you more holistically explore the problem space of minting NFTs, we'll zoom out from the _basic mechanics_ of minting an NFT to instead consider _all the pieces that need to come together_ to build a successful minting platform. If you're considering building your own minting app from scratch, this high-level architectural overview is here to help you along the decision-making process.

## Big decisions

One of the most important things you can do in the early design phase of any development project is to identify the pieces of your design that are going to be the hardest to change your mind about later. This is especially true for blockchain projects, where long-lived immutable data is the norm and it's often expensive or impossible to update data once it's published.

### What platform to use?
Before you can even get started building your minting app, you'll need to decide which blockchain platform to build upon. This is a complex decision with technical, social, and business considerations that all need to be weighed out before your design can start to get specific. When you're deciding upon a platform, here are some key questions to ask yourself:

* **Is the platform active and growing?** This isn't just a popularity contest; an active, growing developer community can be crucial in helping you solve roadblocks you encounter as you build.
* **Do you believe in the long-term prospects of the platform?** There's not much point in spending your time and energy developing for a platform that won't be relevant over time.
* **How easily can new users be onboarded to the platform?** If a platform is easy to build on, but the user experience is less than ideal, you may be causing yourself more grief than you might initially think.
* **Can the technical limits of the platform support your idea, both now and in the long term?** For example, many of the examples here on NFT School use Ethereum, but the transaction limits and gas fees may be a deal-breaker for your use case.

### Do you need a back end? 

One of the compelling promises of blockchain networks is that they can deliver fully decentralized applications that don't require a centralized point of coordination and control. Today, some applications can deliver this, particularly in the decentralized finance space where all the information required for an application to operate can exist on-chain.

NFTs generally combine on-chain data with larger assets and structured metadata that lives off-chain, and managing these assets usually requires some degree of central coordination. For example, if your app mints NFTs on behalf of many users, you'll probably want features like a user account system and some kind of profile page for users to customize. You may also want interactive elements such as comments, "likes", and other bits of state that are easy to fit into a traditional database but difficult and expensive to fit onto a blockchain.

**For most NFT apps today, a back-end system makes practical sense.** However, there can be security considerations; for example, when interacting directly with the blockchain, it's often best to use a browser wallet such as [MetaMask](https://metamask.io/), so that users can sign their own transactions using private keys that never leave their machine.

## Testing and infrastructure

You want to make mistakes where they're cheap, which means staying away from mainnet until you're confident in your code. Building confidence requires dedication to testing. You'll likely want multiple test environments optimized for different criteria, such as speed or an environment's fidelity to mainnet.

**When testing, try to complement your unit tests with integration tests and end-to-end tests that can exercise the dependencies between your web app, its back end (if applicable), and a realistic simulation of your blockchain platform.** Ideally, you should be able to try out your whole stack in an environment that closely resembles the eventual production network.

## Contract design

### On-chain logic

Many NFTs don't need much in the way of custom on-chain logic, apart from the basic ownership and transfer mechanics provided by standards like [ERC-721](https://eips.ethereum.org/EIPS/eip-721). However, if you're designing a more complex system, you may need to incorporate some custom logic into your contract.

**Generally speaking, the time in your development process to write custom on-chain logic is when you need to modify the blockchain state _and_ you require some other bit of blockchain state as input.** For example, if we were writing a clone of [CryptoKitties](https://www.cryptokitties.co/), it wouldn't be safe to read the user's collection of kitties into a JavaScript app, decide whether they had any kitties eligible to "breed", and then record a new transaction to create the "child" kitty. This is because blockchains are fundamentally asynchronous and don't offer any consistency guarantees beyond a single transaction. In this example, by the time a transaction to create the new kitty is processed, its owner may have already sold the "parents". 

By capturing the read and write components of state modification in a single contract function, you can ensure that everything executes in a single transaction and therefore remains consistent. The downside to this method is that you'll probably also need to store some more state on-chain, which could get expensive on general-purpose chains such as Ethereum. For complex mechanics, you may want to investigate blockchains such as [Flow](https://www.onflow.org/), which was originally created to support that very CryptoKitties use case and has since been the foundation of many successful projects, including [NBA Top Shot](https://nbatopshot.com/) and other high-profile marketplaces.

### Upgradability

Most successful web applications evolve over time, but smart contracts are immutable by default and difficult to change. **Before you deploy to mainnet, consider making your contracts upgradeable** using something akin to the [OpenZeppelin Upgrades plugin](https://docs.openzeppelin.com/upgrades-plugins/1.x/). This adds a layer of indirection that allows you to push updates to a deployed contract without requiring all users to connect to a new contract address. Although this adds some complexity and costs a bit more gas, _not_ having the ability to upgrade may prove much more expensive over time!

## User authentication

If you're building an application for multiple users, you'll need some way to keep track of them and allow them to log in. Fortunately, **blockchain accounts can augment or replace traditional user credentials such as usernames and passwords.**

### Wallet-based authentication

It's possible to replace password-based authentication with _wallet-based authentication_. This works by recording a user's public address in your app's back-end systems. When a user wants to log in, the back end delivers a random value (or _nonce_) to sign, and the user creates a signature with their private key using a wallet such as MetaMask. The back end validates that the signature was created by the correct account, and then updates the nonce to prevent it from being reused. For more details on this process, see [this community guide to wallet-based auth on Ethereum](https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial).

If you don't want to deal with writing the whole login flow yourself, you can also use an external service that integrates with your blockchain. For example, [Magic](https://magic.link) provides passwordless authentication via email and other methods, based on the open [Decentralized Identity (DID) standard](https://magic.link/docs/introduction/decentralized-id). Magic's [documentation](https://magic.link/docs/introduction/get-started) shows how to integrate with more than a dozen blockchain networks.

### Accounts and permissions

Not all user accounts are equal, and when you're designing your minting app, you'll need a way to restrict administrative actions to a subset of accounts.

On-chain, this can be accomplished using role-based access control, which lets you limit certain operations to accounts that have been tagged with a particular role. If you're using Ethereum or an EVM-compatible network, the [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control) contract is a great place to get started exploring more about implementing accounts and permissions.

#### Operator accounts

In addition to providing your users with well-permissioned accounts, you might want to perform certain operations on behalf of your users — for example, initiating bulk token transfers or other smart contract operations. Smart contract standards often provide methods for authorizing an account to act on behalf of the token owner. For example, ERC-721's [`setApprovalForAll` function](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721-setApprovalForAll-address-bool-) grants an `operator` account the permission to transfer any token owned by the `owner` account.

This is a powerful capability, so you'll need to be extra careful with the credentials for your privileged accounts. You should also clearly communicate to your users what capabilities your platform's accounts will have and how they will be exercised.

## Next steps

Once you've considered these essential design decisions, you'll be better prepared to start building and testing your app — and releasing it to your users! If you come across any additional tips or tricks you find to be particularly helpful along your build journey, you're invited to share it here on NFT School to make building NFT dApps simpler and quicker for the developer community at large. Just [propose edits to this page on GitHub](https://github.com/protocol/nft-website/blob/main/docs/tutorial/minting-app.md) or even write or [suggest new content](https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=content-or-feature-suggestion.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29) — your fellow developers will thank you!