---
title: Designing a minting app
description: Explore the problem space of minting NFTs in this high-level architecture overview.

---
 # Designing a minting app

 Our [end-to-end experience tutorial](../../tutorial/end-to-end-experience.md) shows how to build a simple web app that mints NFTs on Ethereum, building on a great open-source starter repository called [scaffold-eth](https://github.com/austintgriffith/scaffold-eth).

 This guide zooms out from the basic mechanics of minting an NFT to consider all the pieces that need to come together to build a successful minting platform.

## Big decisions

One of the most important things you can do in the early design phase of a project is to identify the pieces of your design that are going to be the hardest to change your mind about later. This is especially true for blockchain projects, where long-lived immutable data is the norm, and it's often expensive or impossible to update data once published.

### Platforms
Before you can even get started building, you'll need to decide which [blockchain platform](../../concepts/blockchains.md) to build upon. This is a complex decision with technical, social, and business considerations that all need to be weighed out before a design can start to get specific. Some key questions to ask:

* Is the platform active and growing?
* Do you believe in the long-term prospects of the platform?
* How easily can new users be "onboarded" to the platform?
* Can the technical limits of the platform support your idea?
  - Many of the examples at NFT School use Ethereum, but the transaction limits and gas fees may be a deal-breaker for your use case.

### Do you need a backend? 

One of the compelling promises of blockchain networks is that they can deliver fully decentralized applications that don't require a centralized point of coordination and control. Today, some applications are able to deliver this, particularly in the decentralized finance space where all information required for the application to operate exists on-chain.

NFTs generally combine on-chain data with larger assets and structured metadata that lives off-chain, and managing these assets generally requires some degree of central coordination. For example, if your app mints NFTs on behalf of many users, you'll probably want an account system and some kind of profile page. You may also want interactive elements like comments, "likes", and other bits of state that are easy to fit into a traditional database but hard and expensive to fit into a blockchain.

For most NFT apps today, a backend system makes practical sense. However, when interacting directly with the blockchain, it's often best to use a browser wallet like [MetaMask](https://metamask.io/), so that users can sign their own transactions using private keys that never leave their machine.

## Testing and infrastructure

You want to make mistakes where they're cheap, which means staying away from mainnet until you're confident in your code. Building confidence requires dedication to testing. You'll likely want multiple test environments optimized for different criteria, e.g. speed, fidelity to mainnet, etc.

When testing, try to complement your unit tests with integration and end-to-end tests that can exercise the dependencies between your web app, backend (if applicable), and a realistic simulation of your blockchain platform. Ideally, you should be able to try out your whole stack in an environment that closely resembles the eventual production network.

## Contract design

### On-chain logic

Many NFTs don't need much in the way of custom on-chain logic, apart from the basic ownership and transfer mechanics provided by standards like ERC-721.

If you're designing a more complex system, you may need to incorporate some custom logic into your contract.

Generally speaking, the time to write custom on-chain logic is when you need to modify the blockchain state, _and_ you require some other bit of blockchain state as input. For example, if we were writing a clone of [CryptoKitties](https://www.cryptokitties.co/), it wouldn't be safe to read the users collection of kitties into a JavaScript app, decide whether they had any eligible to "breed", then record a new transaction to create the "child" kitty. This is because blockchains are fundamentally asynchronous and don't offer any consistency guarantees beyond a single transaction. By the time the transaction to create the new kitty is processed, the owner may have already sold the "parents". 

By capturing the read and write components of state modification in a single contract function, you can ensure everything executes in a single transaction and remains consistent. The downside is that you'll probably also need to store some more state on-chain, which could get expensive on general purpose chains like Ethereum. For complex mechanics, you may want to investigate blockchains like [Flow](https://www.onflow.org/), which was created to support CryptoKitties and has since been the foundation of many successful projects, including [NBA Top Shot](https://nbatopshot.com/) and other high-profile marketplaces.

### Upgradability

Most successful web applications evolve over time, but smart contracts are immutable by default and difficult to change. Before you deploy to mainnet, consider making your contracts "upgradeable" using something akin to the [OpenZeppelin Upgrades plugin](https://docs.openzeppelin.com/upgrades-plugins/1.x/). This adds a layer of indirection that allows you to push updates to a deployed contract without requiring all users to connect to a new contract address. Although this adds some complexity and costs a bit more gas, not having the ability to upgrade may prove much more expensive in the long run!

## User authentication

If you're building an application for multiple users, you'll need some way to keep track of them and allow them to log in. Blockchain accounts can augment or replace traditional user credentials like usernames and passwords.

### Wallet based auth

It's possible to replace password-based authentication with "wallet-based" authentication. This works by recording a users public address in our backend systems. When the user wants to log in, the backend delivers a random value (or "nonce") to sign, and the user creates a signature with their private key using a wallet like MetaMask. The backend validates that the signature was created by the right account, then updates the nonce to prevent it from being reused.

For more details, see [this external guide to wallet-based auth on Ethereum](https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial).

As an alternative to doing the whole login flow yourself, you can use an external service that integrates with the blockchain. [Magic.link](https://magic.link) provides passwordless authentication via email, and other methods, based on an open [Decentralized Identity standard](https://magic.link/docs/introduction/decentralized-id). Their [documentation](https://magic.link/docs/introduction/get-started) shows how to integrate with over a dozen blockchain networks.

### Accounts and permissions

Not all user accounts are equal, and you'll need a way to restrict administrative actions to a subset of accounts.

On-chain, this can be accomplished with role-based access control, which lets you limit certain operations to accounts that have been tagged with a given "role". If you're using Ethereum or an EVM-compatible network, the [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control) contract is a great place to get started.

#### Operator accounts

You might want to perform certain operations on behalf of your users, for example, initiating bulk token transfers or other smart contract operations. Smart contract standards often provide methods for authorizing an account to act on behalf of the token owner. For example, ERC-721's[`setApprovalForAll` function](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721-setApprovalForAll-address-bool-) grants an `operator` account the permission to transfer any token owned by the `owner` account.

This is a powerful capability, but you'll need to be extra careful with the credentials for your privileged accounts. You should also clearly communicate to your users what capabilities your platform's accounts will have and how they will be exercised.