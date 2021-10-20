---
title: Building an NFT Marketplace on Flow
description: A step-by-step guide to build an NFT pet marketplace on Flow.
issueUrl: https://github.com/protocol/nft-website/issues/146
related:
  'How to Create NFTs Like NBA Top Shot With Flow and IPFS': https://medium.com/pinata/how-to-create-nfts-like-nba-top-shot-with-flow-and-ipfs-701296944bf
  'Mint an NFT with IPFS': https://docs.ipfs.io/how-to/mint-nfts-with-ipfs/#a-short-introduction-to-nfts
---

# Building an NFT Marketplace on Flow

This tutorial will teach you to create a simple NFT marketplace on [Flow][flow] from scratch.

## Table of content

- [Prerequisites](#prerequisites)
- [What you will learn](#what-you-will-learn)
- [Ownership and Resource](#ownership-and-resource)
  - [Resource](#resource)
  - [Accounts](#accounts)
  - [Contract](#contract)


## Prerequisites

Although this tutorial is built specifically for Flow, it will build up a general understanding of smart contract and NFTs. Therefore, you are expected to have a working JavaScript and [React.js][react] knowledge and a basic familiarity with blockchains, web3, and NFTs.

You will need to install [Node.js][nodejs] and npm (comes with Node.js), [Flow command line tool][flow-cli], and [Docker compose][docker-compose] to follow this tutorial.

> **💡 Why React?**    
> React.js was chosen for this tutorial because it is the most widely-used UI library that
> arguably takes away the tediousness of setting up a JavaScript app
> and the state management. You are welcome to work with another library
> or framework if you are happy to take on the additional work of
> taking the [road less travelled][robert-frost-poem] approach.

If you are not familiar with the concept of smart contracts and NFTs, it is worth zipping through [blockchain][blockchain-basic] and [NFT][nft-basic] basics before diving in.

## What you will learn

You will learn the basic NFT building blocks from the ground up, such as:

 - Smart contracts and the [Cadence language][cadence]
 - User authentication
 - Minting and storing tokens' metadata on [Filecoin/IPFS][nft-storage]
 - Transferring tokens

As we build a minimal version of the [Flowwow NFT pet store][flowwow] together.

If you would like to go through a structured, step-by-step tutorial, the chapter-by-chapter project is available on [Github][mini-petstore].

## Ownership and Resource

Let's get a leveled understanding here. A blockchain, or distributed ledger, is all about tracking *ownership* of some *thing*, or a resource. There is nothing new about the ledger part--Your bank account's ledger keeps track of how much money you *own* and how much is *spent* or transferred to a new owner at any time. The key components to a ledger are:

1. The [resource](resource) at play, in this case money.
2. The [accounts](accounts) owning the resource, or the right to access it in some ways.
3. The [contract](contract) or rule to govern them.

### Resource
The resource can be any *thing*--from money to crop to digital monster--as long as the type of resource is agreed upon by all accounts.

### Accounts
Each account owns a ledger of its own to keep track of the spending (transferring) and imbursing (receiving) of the resource.

### Contract
The contract is a rule governing how this "game" is played. Accounts that break the contract can be punished in some way. Normally, it is the authority like the bank who creates this contract for all accounts.

Because these ledgers are owned and managed by trusted agents like your bank, when you transfer the ownership of a few dollars (`-$4.00`) to buy a cup of coffee, the bank needs to be consistent and update its ledger with new money that the cafe owner now owns (`+$4.00`). Because both your and the cafe owner's ledgers are not visible to both of you and the `$4.00` money is purely digital, there is nothing to guarantee that the bank to mistakenly update the ledger with the incorrect value.

> **💡 Your bank owes you**    
> If you have a saving account with some money in it, you might be loaning
> your money to your bank. You are trusting your bank to have your money when
> you want to withdraw. Meanwhile, your money is just part of the stream of
> your bank is free to do anything with. If you had a billion dollars in your
> bank and you want to withdraw tomorrow, your teller might freak out.

What is novel about blockchain is the distributed part. Because the ledger is *decentralized*, there is no central authority like a bank for you to trust with the bookkeeping. You are simply trusting other people running the same ledger software as you to keep track of everyone's book. Think of it as a sport game without the referee or umpire where any dispute is distributed to all the audience to judge. The only difference is these audience members are also playing in the arena, with the stake that makes it extremely bad for them to cheat. This way, any small inconsistencies are likely caught and rejected fair and square. You are no longer trusting your bank. The eternal flow of ownerships hence becomes *trustless* because everyone is doing what's best for themselves.

"Why such emphasis on ownership?" you may ask. This is because Flow has the concept of resource ownership baked right into the smart contract core. In fact, it is why Flow is one of the easiest blockchains for building NFT apps, which you shall see very soon.

## Cadence

Like Solidity for Ethereum, we use [Cadence][cadence] to code smart contracts, transactions, and scripts for Flow. Cadence's design is inspired by [Rust][rust] and the *move semantic*. Basically, the runtime tracks when a resource is being *moved* from a variable to another variable and makes sure it can never be used twice in the program.

The three types of Cadence program you will be writing are [contracts](contract), [transactions][transaction], and [scripts][script].

### Contract

A contract is an initial program that gets deployed to the blockchain, initiating the logic for your app and allowing access to resources you create and the capabilities that come with them.

Two most common constructs in a contract are resources and interfaces.

#### Resources

Resources are items stored in user accounts that are accessible
through access control measures defined in the contract. They are usually the assets being tracked. They are akin to classes or structs in some languages.

#### Interfaces

Interfaces define the behaviors or capabilities of resources. They are akin to interfaces in some languages. They are usually implemented by resources.

Here is an example of an `NFT` resource and a `Ownable` interface (ala [ERC721][erc-721]) in the `PetStore` contract:

```cadence

pub contract PetStore {

    // A map recording owners of NFTs
    pub var owners: {UInt64 : Address}

    // NFT resource implements Transferrable
    pub resource NFT: Transferrable {

        // Unique id for each NFT.
        pub let id: UInt64

        // Constructor method.
        init(initId: UInt64) {
            self.id = initId
        }

        pub fun owner(): Address {
          return owners[self.id]!
        }

        pub fun transferTo(recipient: Address) {
          // Code to transfer this NFT resource to the recipient's address.
        }
    }

    // A Transferrable interface declaring some methods or "capabilities"
    pub resource interface Transferrable {
      pub fun owner(): Address
      pub fun transferTo(recipient: Address)
    }
}

```

Note the access modifier `pub` before the definition of `contract`, `resource`, and variable `id`. This declares full access to all user accounts. Writing a Cadence contract revolves around designing access control.

### Transaction

Transactions tell the on-chain contract to change the state of the chain. Because the change is synchronized throughout the peers and cannot be undone, like Ethereum, a transaction is considered a *write* operation that incurs a network gas fee. They also require one or more accounts to sign and authorize.
Minting and transferring tokens are transactions.

Here is an example of a transaction, requiring a current account who owns the `NFT` resource to authorize a certain action (in this case, just logging `"Hello, transaction"`).

```cadence

transaction(tokenId: UInt64, recipientAddr: Address) {

    // The field holds the NFT as it is being transferred.
    let token: @PetStore.NFT

    // Takes the sending account as a parameter to
    prepare(acc: AuthAccount) {
        // This is the code that requires a signature, such as
        // withdrawing a token from the signing account.
    }

    execute {
        // This is the code that does not require a signature.
        log("Hello, transaction")
    }
}

```

### Script

Scripts are Cadence programs that are run on the client to *read* the state of the chain. Therefore, they do not incur any gas fee and do not need an account to sign them.

Here is an example of a script reading an NFT's current owner's account address by accessing the map field named `owners` on the contract by an `NFT` id:

```cadence

// Take a target NFT's id as a parameter and return an Address
// of the current owner of that NFT.
pub fun main(id: UInt64) : Address {
    return PetStore.owner[id]!
}

```

Both transactions and scripts are invoked on the client side.

> **💡 Interface in other languages**    
> If you have programmed in a typed language like Java,
> Rust, or TypeScript, you might be familiar with the
> interface, which is a description of capabilities
> versus a concrete entity like a class or struct.
> In Cadence, a resource is similar to a class or struct
> and an interface is the same as those in Java or Rust.

## NFT Pet Store

Now that we have a basic understanding of how to think in Flow's way, we are ready to start building the mini NFT pet store!

If you have [cloned the structured tutorial][mini-petstore], in your shell, type `cd 1_getting_started` and run `npm install` to get started.

Otherwise, create a new React app by typing `npx create-react-app petstore` on your shell, then enter the directory with `cd petstore`.

### Project structure

If you are working on the cloned project, you can skip this section.

Because `create-react-app` forbids importing code from outside of the `src` directory, the majority of the code we write will be inside this directory.

Create a directory named `flow` inside `src` directory, and create three more named `contract`, `transaction`, and `script` under `flow`. This can be combined into one command:

```shell
$ mkdir -p src/flow/{contract,transaction,script}
```

As you might have guessed, each directory will contain the corresponding Cadence code for each type of interaction.

Now, in each of these directories, create a Cadence file with the following names: `contract/PetStore.cdc`, `transaction/MintToken.cdc`, and `script/GetTokenIds.cdc`.

The structure of the `src` directory should now look like this:

```shell
.
|-- flow
|   |-- contract
|   |   |
|   |   `-- PetStore.cdc
|   |-- script
|   |   |
|   |   `-- GetTokenIds.cdc
|   `-- transaction
|       |
|       `-- MintToken.cdc
|
...

```

### `PetStore` contract

We will be taking some time to write the contract while also learn Cadence. Once you have grasped it, writing transactions and scripts will be relatively easy.

First, create the contract structure and define an `NFT` resource:

```cadence

pub contract PetStore {

    // A map recording owners of NFTs
    pub var owners: [Address?]

    pub resource NFT {

        // Unique id for each NFT.
        pub let id: UInt64

        // Constructor method.
        init(initId: UInt64) {
            self.id = initId
        }
    }
}

```

Note that we have also declared a variable named `owners` of type [Variable-sized Array][cdc-array-type] which contains [Optional][cdc-optional-type] type that either is an [Address][cdc-address-type] or `nil`. We will use `owners` to keep track of all the current owners of NFTs that will be minted on this contract globally. And because each `NFT` has an `id` of type [UInt64][cdc-integer-type], an `Array` is perfect for keeping track of the owners' `Addresses`. 

However, because we start the NFT id from 1 instead of 0, we want a way to store a `nil` Address in the first position of `owners` Array. We decide to make our Array to store an Optional Address type (`Address?`).

> **💡 The Billion-dollar mistake**    
> In language like Python, JavaScript, and Java, an empty
> value is represented by `None`, `null` or `undefined`, and
> `null`, respectively. However, this value is *not* a type,
> and any data can be empty at any time, making it extremely
> risky. For example, the `NullPointerException` is infamous for
> crashing Java programs.
>
> Some strongly-typed language such as Ocaml, Haskell, Rust, and
> Cadence have a class of type called `Optional` (or `Maybe` in
> Haskell) to represent a value that may be empty. This means it
> is impossible to have a `null` value if the type isn't Optional.









## TBC

 [flow]: https://www.onflow.org/
 [flow-cli]: https://www.onflow.org/cli/
 [docker-compose]: https://docker.com/compose/
 [blockchain-basic]: ../concepts/blockchain.md
 [nft-basic]: ../concepts/non-fungible-tokens.md
 [nodejs]: https://nodejs.org/
 [cadence]: https://docs.onflow.org/cadence/language/
 [nft-storage]: https://nft.storage/
 [flowwow]: https://github.com/jochasinga/flowwow/
 [react]: https://reactjs.org/
 [robert-frost-poem]: https://www.poetryfoundation.org/poems/44272/the-road-not-taken
 [mini-petstore]: https://github.com/jochasinga/flow-react
 [rust]: https://rust-lang.org/
 [diem]: https://diem.org/
 [erc-721]: https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
 [cdc-array-type]: https://docs.onflow.org/cadence/language/values-and-types/#array-types
 [cdc-optional-type]: https://docs.onflow.org/cadence/language/values-and-types/#optionals
 [cdc-address-type]: https://docs.onflow.org/cadence/language/values-and-types/#addresses
 [cdc-integer-type]: 
https://docs.onflow.org/cadence/language/values-and-types/#integers

<ContentStatus />
