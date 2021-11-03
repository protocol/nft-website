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

## Table of content (WIP)

- [Prerequisites](#prerequisites)
- [What you will learn](#what-you-will-learn)
- [Ownership and Resource](#ownership-and-resource)
  - [Resource](#resource)
  - [Accounts](#accounts)
  - [Contract](#contract)


## Prerequisites

Although this tutorial is built specifically for Flow, it will build up a general understanding of smart contract and NFTs. Therefore, you are expected to have a working JavaScript and [React.js][react] knowledge and a basic familiarity with blockchains, web3, and NFTs.

You will need to install [Node.js][nodejs] and npm (comes with Node.js), [Flow command line tool][flow-cli], and [Docker compose][docker-compose] to follow this tutorial.

You can use any code editor of your choice, but I recommend [VSCode][vscode] with [Cadence Language support][vscode-cdc-ext] for smooth sailing experience.

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

Resources can only be in one place at a time, and they are said to be *moved* rather than *assigned*.

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

Otherwise, create a new React app by typing the following commands on your shell:

```shell

$ npx create-react-app petstore; cd petstore
$ flow init   # Initialize a Flow project and create a flow.json file.

```

You should see a new React project created with a `flow.json` configuration file inside. Let's take a closer look at the structure and configure the project.

### Project structure

If you are working on the cloned project, you can skip this section.

First of all, note the `flow.json` file under the root directory. This configuration file was created when we typed the command `flow init` and tells Flow that this is, indeed, a Flow project. We will leave most of the initial settings as they are, but make sure your file contains these fields by adding or changing them accordingly:

```
{
    // ...

    "contracts": {
        "PetStore": "./src/flow/contracts/PetStore.cdc"
    },

    "deployments": {
		"emulator": {
			"emulator-account": ["PetStore"]
		}
	},

    // ...
}

```

These fields tell Flow where to look for the contract so we will be able to run the command line to deploy it to the Flow emulator. Now we will need to add some directories for our Cadence code.

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

    // An array that stores NFT owners
    pub var owners: {UInt64: Address}

    pub resource NFT {

        // Unique ID for each NFT
        pub let id: UInt64

        // String mapping to hold metadata
        pub var metadata: {String: String}

        // Constructor method
        init(id: UInt64, metadata: {String: String}) {
            self.id = id
            self.metadata = metadata
        }
    }
}

```

Note that we have declared a [Dictionary][cdc-dict-type] and store in a variable named `owners`. This dictionary has the type `{UInt64: Address}` which maps [unsigned 64-bit integers][cdc-integer-type] to users' [Addresses][cdc-address-type]. We will use `owners` to keep track of all the current owners of NFTs globally.

Next, we instantialize the array with a `nil` stored as the first element in the `init()` constructor method. In Cadence, it is an error

Also note that the `owners` variable is prepended by a `var` keyword, while the `id` variable is prepended by a `let` keyword. In Cadence, a mutable variable is defined using `var` while an immutable one is defined with `let`.

> **💡 Immutable vs mutable**    
> In Cadence, a variable stores a mutable variable that can be changed
> later in the program while a *binding* binds an immutable value that
> cannot be changed.

In the body of `NFT` resource, we declare `id` field and a constructor method to assign the `id` to the `NFT` instance.

### `NFTReceiver`

Next, we create an `NFTReceiver` interface that defines the capabilities or methods of a receiver of NFTs, or the rest of the users who are not the contract user.

To reiterate, an interface is *not* an instance of an object, like a user account. It is a set of behaviors, or capabilities in Cadence's speak, that a resource can implement to become capable of certain actions, like withdrawing and depositing tokens.

```cadence

pub contract PetStore {

    // ... The @NFT code ...

    pub resource interface NFTReceiver {

        // Withdraw a token by its ID and returns the token.
        pub fun withdraw(id: UInt64): @NFT

        // Deposit an NFT to this NFTReceiver instance.
        pub fun deposit(token: @NFT)

        // Get all NFT IDs belonging to this NFTReceiver instance.
        pub fun getTokenIds(): [UInt64]

        // Get the metadata of an NFT instance by its ID.
        pub fun getTokenMetadata(id: UInt64) : {String: String}

        // Update the metadata of an NFT.
        pub fun updateTokenMetadata(id: UInt64, metadata: {String: String})
    }
}

```

Let's not get over ourselves and go through the `NFTReceiver` interface line-by-line.

The `withdraw(id: UInt64): @NFT` method takes an NFT's `id`, withdraws a token, or an *instance* of `NFT` resource, which is prepended with a `@` to mean reference to a resource.

The `deposit(token: @NFT, metadata: {String : String})` method takes a token reference type and the metadata dictionary with a `String` key and `String` value, and deposits or transfers the `@NFT` to the current instance of `NFTReceiver`.

The `getTokenIds(): [UInt64]` method access all tokens' IDs owned by the instance of the `NFTReceiver`.

The `getTokenMetadata(id: UInt64) : {String : String}` method takes an ID of an `NFT`, read the metadata, and return the it as a dictionary.

### `NFTCollection`

Now let's create an `NFTCollection` resource to implement the `NFTReceiver` interface. Think of this as a "vault" where NFTs are deposited to and withdrawn from.

```cadence

pub contract PetStore {

    // ... The @NFT code ...

    // ... The @NFTReceiver code ...

    pub resource NFTCollection: NFTReceiver {

        // Keeps track of NFTs this collection.
        access(account) var ownedNFTs: @{UInt64: NFT}

        // Constructor
        init() {
            self.ownedNFTs <- {}
        }

        // Destructor
        destroy() {
            destroy self.ownedNFTs
        }

        // Withdraws and return an NFT token.
        pub fun withdraw(id: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: id)
            return <- token!
        }

        // Deposits a token to this NFTCollection instance.
        pub fun deposit(token: @NFT) {
            self.ownedNFTs[token.id] <-! token
        }

        // Returns an array of the IDs that are in this collection.
        pub fun getTokenIds(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // Returns the metadata of an NFT based on the ID.
        pub fun getTokenMetadata(id: UInt64): {String : String} {
            let metadata = self.ownedNFTs[id]?.metadata
            return metadata!
        }

        // Updates the metadata of an NFT based on the ID.
        pub fun updateTokenMetadata(id: UInt64, metadata: {String: String}) {
            for key in metadata.keys {
                self.ownedNFTs[id]?.metadata?.insert(key: key,  metadata[key]!)
            }
        }
    }

    // Public factory method to create a collection
    // so it is callable from the contract scope.
    pub fun createNFTCollection(): @NFTCollection {
        return <- create NFTCollection()
    }
}

```

That's a handful of new code. It will soon become natural to you with patience.

First we declare a mutable dictionary and store it in a variable named `ownedNFTs`. Note the new access modifier `pub(set)`, which gives public write access to the users.

This dictionary stores the NFTs for this collection by mapping the ID to NFT resource. Note that because the dictionary stores `@NFT` resources, we prepend the type with `@`, making itself a resource too.

In the contructor method, `init()`, we instantiate the `ownedNFTs` with an empty dictionary. A resource also need a `destroy()` destructor method to make sure it is being freed.

> **💡 Nested Resource**    
> A [composite structure][cdc-comp-type] including a dictionary
> can store resources, but when they do they will be treated as
> resources. Which means they need to be *moved* rather than
> *assigned* and their type will be annotated with `@`.

The `withdraw(id: UInt64): @NFT` method remove an NFT from the collection's `ownedNFTs` array and return it.

The left-pointing arrow character is knowned as a *move* symbol, and we use it to move a resource around. Once a resource has been moved, it can no longer be used from the old variable.

Note the `!` symbol after the `token` variable. It [force-unwraps][cdc-force-unwrap] the `Optional` value. If the value turns out to be `nil`, the program panics and crashes.

Because resources are core to Cadence, their types are annotated with a `@` to make them explicit. For instance, `@NFT` and `@NFTCollection` are two resource types.

The `deposit(token: @NFT)` function takes the `@NFT` resource as a parameter and store it in the `ownedNFTs` array in this `@NFTCollection` instance.

The `!` symbol reappears here, but now it's after the move arrow `<-!`. This is called a [force-move or force-assign][cdc-force-assign] operator, which only move a resource to a variable if the variable is `nil`. Otherwise, the program panics.

The `getTokenIds(): [UInt64]` method simply reads all the `UInt64` keys of the `ownedNFTs` dictionary and returns them as an array.

The `getTokenMetadata(id: UInt64): {String : String}` method reads the `metadata` field of an `@NFT` stored by its ID in the `ownedNFTs` dictionary and returns it.

The `updateTokenMetadata(id: UInt64, metadata: {String: String})` method is a bit more involved.

```cadence

for key in metadata.keys {
    self.ownedNFTs[id]?.metadata?.insert(key: key,  metadata[key]!)
}

```

In the body of the method, we loop over all the keys of the given metadata, inserting into the current metadata dictionary the new value. Note the `?` in the call chain. It is used with `Optional`s values to keep going down the call chain only if the value is not `nil`.

We have successfully implemented the `@NFTReceiver` interface for the `@NFTCollection` resource.

### `NFTMinter`

The last and very important component for our `PetStore` contract is `@NFTMinter` resource, which will contain an exclusive code for the contract owner to mint all the tokens. Without it, our store will not be able to mint any pet for the users. It is very simplistic though, since we have already blaze through the more complex components. Its only `mint(): @NFT` method creates an `@NFT` resource, give it an ID, save the address of the first owner to the contract (which is the address of the contract owner, although you could change it to mint and transfer to the creator's address in one step), increment the universal ID counter, and return the new token.


```cadence

pub contract PetStore {

    // ... NFT code ...

    // ... NFTReceiver code ...

    // ... NFTCollection code ...

    pub resource NFTMinter {

        // Declare a global variable to count ID.
        pub var idCount: UInt64

        init() {
            // Instantialize the ID counter.
            self.idCount = 1
        }

        pub fun mint(_ metadata: {String: String}): @NFT {

            // Create a new @NFT resource with the current ID.
            let token <- create NFT(id: self.idCount, metadata: metadata)

            // Save the current owner's address to the dictionary.
            PetStore.owners[self.idCount] = PetStore.account.address

            // Increment the ID
            self.idCount = self.idCount + 1 as UInt64

            return <-token
        }
    }
}

```

By now, we have all the bolts and nuts we need for the contract. The only thing that is missing is a way to initialize this contract once during the deployment. Let's create a constructor method to create an empty `@NFTCollection` instance for the deployer of the contract (you) so it is possible for the contract owner to mint and store NFTs from the contract. As we go over this last hurdle, we will also learn about the last important concept Cadence: [Storage and domains][cdc-domain].


```cadence

pub contract PetStore {

    // ... @NFT code ...

    // ... @NFTReceiver code ...

    // ... @NFTCollection code ...

    // This contract constructor is called once when the  contract is deployed.
    // It does the following:
    //
    // - Creating an empty Collection for the deployer of the collection so
    //   the owner of the contract can mint and own NFTs from that contract.
    //
    // - The `Collection` resource is published in a public location with reference
    //   to the `NFTReceiver` interface. This is how we tell the contract that the functions defined
    //   on the `NFTReceiver` can be called by anyone.
    //
    // - The `NFTMinter` resource is saved in the account storage for the creator of
    //   the contract. Only the creator can mint tokens.
    init() {
        // Set `owners` to an empty dictionary.
        self.owners = {}

        // Create a new `@NFTCollection` instance and save it in `/storage/NFTCollection` domain,
        // which is only accessible by the contract owner's account.
        self.account.save(<-create NFTCollection(), to: /storage/NFTCollection)

        // "Link" only the `@NFTReceiver` interface from the `@NFTCollection` stored at `/storage/NFTCollection` domain to the `/public/NFTReceiver` domain, which is accessible to any user.
        self.account.link<&{NFTReceiver}>(/public/NFTReceiver, target: /storage/NFTCollection)

        // Create a new `@NFTMinter` instance and save it in `/storage/NFTMinter` domain, accesible
        // only by the contract owner's account.
        self.account.save(<-create NFTMinter(), to: /storage/NFTMinter)
    }
}

```

Hopefully, the high-level steps are clear to you after you have followed through the comments. We will talk about domains briefly here. Domains are general-purpose storages accessible to Flow accounts common used for storing resources. Intuitively, they are similar to common filesystems. There are three domain namespaces in Cadence:

#### `/storage`

This namespace can only be accessed by the owner of the account.

#### `/private`

This namespace is used to stored private objects and [capabilities](https://docs.onflow.org/cadence/language/capability-based-access-control/) whose access can be granted to selected accounts.

#### `/public`

This namespace is accessible by all accounts that interact with the contract.

In our previous code, we created an `@NFTCollection` instance for our own account and saved it to the `/storage/NFTCollection` namespace. The path following the first namespace is arbitrary, so we could have named it `/storage/my/nft/collection`. Then, something odd happened as we "link" a [reference][cdc-reference] to the `@NFTReceiver` capability from the `/storage` domain to `/public`. The caret pair `<` and `>` was used to explicitly annotate the type of the reference being linked, `&{NFTReceiver}`, with the `&` and the wrapping brackets `{` and `}` to define the *unauthorized reference* type (see [References][cdc-reference] to learn more). Last but not least, we created the `@NFTMinter` instance and saved it to our account's `/storage/NFTMinter` domain.

> For a deep dive into storages, check out [Account Storage][cdc-domain].

As we wrap up our `PetStore` contract, let's try to deploy it to Flow emulator to verify the contract! In your shell, start the emulator with `flow emulator`. You should see an output similar to this:

```shell

INFO[0000] ⚙️   Using service account 0xf8d6e0586b0a20c7  serviceAddress=f8d6e0586b0a20c7 serviceHashAlgo=SHA3_256 servicePrivKey=bd7a891abd496c9cf933214d2eab26b2a41d614d81fc62763d2c3f65d33326b0 servicePubKey=5f5f1442afcf0c817a3b4e1ecd10c73d151aae6b6af74c0e03385fb840079c2655f4a9e200894fd40d51a27c2507a8f05695f3fba240319a8a2add1c598b5635 serviceSigAlgo=ECDSA_P256
INFO[0000] 📜  Flow contracts                             FlowFees=0xe5a8b7f23e8b548f FlowServiceAccount=0xf8d6e0586b0a20c7 FlowStorageFees=0xf8d6e0586b0a20c7 FlowToken=0x0ae53cb6e3f42a79 FungibleToken=0xee82856bf20e2aa6
INFO[0000] 🌱  Starting gRPC server on port 3569          port=3569
INFO[0000] 🌱  Starting HTTP server on port 8080          port=8080

```

Take note of the `FlowServiceAccount` address, which is a base-16 hexadecimal number `0xf8d6e0586b0a20c7` (In fact, these numbers are so ubiquitous in Flow that it has its own type: an `Address` type). This is the address of the contract on the emulator.

Open up a new shell, making sure you are inside the project directory, then type `flow project deploy` to deploy our first contract. You should see an output similar to this if it was successful:

```shell

Deploying 1 contracts for accounts: emulator-account

PetStore -> 0xf8d6e0586b0a20c7 (11e3afe90dc3a819ec9736a0a36d29d07a2f7bca856ae307dcccf4b455788710)


✨ All contracts deployed successfully

```

Congratulations! You have learned how to write and deploy your first Flow smart contract.

> **⚠️ Oops, it didn't work!**    
> Check `flow.json` configuration and make sure the [path to the contract](#project-structure) is correct.

### `MintToken` transaction

The first and most important transaction for *any* NFT app is perhaps the one that mints tokens into existence! Without it there won't be any cute tokens to sell and trade. So let's start coding:

```cadence

// MintToken.cdc

// Import the `PetStore` contract instance from the master account address.
// This is a fixed address for used with the emulator only.
import PetStore from 0xf8d6e0586b0a20c7

transaction(metadata: {String: String}) {

    // Declare an "unauthorized" reference to `NFTReceiver` interface.
    let receiverRef: &{PetStore.NFTReceiver}

    // Declare an "authorized" reference to the `NFTMinter` interface.
    let minterRef: &PetStore.NFTMinter

    // `prepare` block always take one or more `AuthAccount` parameter(s) to indicate
    // who are signing the transaction.
    // It takes the account info of the user trying to execute the transaction and
    // validate. In this case, the contract owner's account.
    // Here we try to "borrow" the capabilities available on `NFTMinter` and `NFTReceiver`
    // resources, and will fail if the user executing this transaction does not have access
    // to these resources.
    prepare(account: AuthAccount) {

        // Note that we have to call `getCapability(_ domain: Domain)` on the account
        // object before we can `borrow()`.
        self.receiverRef = account.getCapability<&{PetStore.NFTReceiver}>(/public/NFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")

        // With an authorized reference, we can just `borrow()` it.
        // Note that `NFTMinter` is borrowed from `/storage` domain namespace, which
        // means it is only accessible to this account.
        self.minterRef = account.borrow<&PetStore.NFTMinter>(from: /storage/NFTMinter)
            ?? panic("Could not borrow minter reference")
    }

    // `execute` block executes after the `prepare` block is signed and validated.
    execute {
        // Mint the token by calling `mint(metadata: {String: String})` on `@NFTMinter` resource, which returns an `@NFT` resource, and move it to a variable `newToken`.
        let newToken <- self.minterRef.mint(metadata)

        // Call `deposit(token: @NFT)` on the `@NFTReceiver` resource to deposit the token.
        // Note that this is where the metadata can be changed before transferring.
        self.receiverRef.deposit(token: <-newToken)
    }
}

```

> **⚠️ Ambiguous type warning**    
> If you are using VSCode, chances are you might see the editor flagging the
> lines referring to `PetStore.NFTReceiver` and `PetStore.NFTMinter` types
> with an "ambiguous type <T> not found". Try to reset the running emulator
> by pressing `Ctrl+C` in the shell where you ran the emulator to interrupt it
> and run it again with `flow emulator` and on a different shell, don't forget
> to redeploy the contract with `flow project deploy`.

The first line of the transaction code imports the `PetStore` contract instance.

The `transaction` block takes an arbitrary number of named parameters, which will be provided by the calling program (In Flow CLI, JavaScript, Go, or other language). These parameters are the only channels for the transaction code to interact with the outside world.

Next, we declare references `&{NFTReceiver}` and `&NFTMinter` (Note the first is an unauthorized reference).

Now we enter the `prepare` block, which is responsible for authorizing the transaction. This block takes an argument of type `AuthAccount`. This account instance is required to sign and validate the transaction with its key. If it takes more than one `AuthAccount` parameters, then the transaction becomes a *multi-signature* transaction. This is the only place our code can access the account object.

What we did was calling `getCapability(/public/NFTReceiver)` on the account instance, then `borrow()` to borrow the reference to `NFTReceiver` and gain the capability for `receiverRef` to receive tokens. We also called `borrow(from: /storage/NFTMinter)` on the account to enable `minterRef` with the superpower to mint tokens into existence.

The `execute` block runs the code within after the `prepare` block succeeds. Here, we called `mint(metadata: {String: String})` on the `minterRef` reference, then moved the newly created `@NFT` instance into a `newToken` variable. After, we called `deposit(token: @NFT)` on the `receiverRef` reference, passing `<-newToken` (`@NFT` resource) as an argument. The newly minted token is now stored in our account's `receiverRef`.

Let's try to send this transaction to the running emulator and mint a token! Because this transaction takes a `metadata` of type `{String: String}` (string to string dictionary), we will need to pass that argument when sending the command via Flow CLI.

```shell

$ flow transactions send src/flow/transaction/MintToken.cdc '{"name": "Max", "breed": "Bulldog"}'

```

With a bit of luck, you should get a happy output telling you that the transaction is *sealed*.

```shell

Transaction ID: b10a6f2a1f1d88f99e562e72b2eb4fa3ae690df591d5a9111318b07b8a72e060

Status		✅ SEALED
ID		b10a6f2a1f1d88f99e562e72b2eb4fa3ae690df591d5a9111318b07b8a72e060
Payer		f8d6e0586b0a20c7
Authorizers	[f8d6e0586b0a20c7]

# ...

```

Note the transaction ID returned from the transaction. Every transaction returns an ID no matter if it succeeds or not.

Congratulations on minting your first NFT pet on Flow! It does not have a face yet besides just a name and breed, but we will touch on uploading static images (and even videos) onto the IPFS/Filecoin network using [nft.storage][nft-storage] later.

### `TransferToken` transaction

As we, the contract owner, are able to mint Flow NFTs. The next natural step is to learn how to transfer them to different users. Since this transfer action writes to the blockchain and mutates the state, it is also a transaction.

Before we can transfer a token to another user's account, we need another receiving account to deposit a token to (We could transfer a token to *our* address, but that wouldn't be very interesting, would it?). At the moment, we have been working with only our emulator account so far. So, let's create an account through the Flow CLI.

First, create a public-private key pair by typing `flow keys generate`. The output should look similar to the following, while **the keys will be different**:

```shell

🔴️ Store private key safely and don't share with anyone!
Private Key  f410328ecea1757efd2e30b6bc692277a51537f30d8555106a3186b3686a2de6
Public Key 	 be393a6e522ae951ed924a88a70ae4cfa4fd59a7411168ebb8330ae47cf02aec489a7e90f6c694c4adf4c95d192fa00143ea8639ea795e306a27e7398cd57bd9

```

For convenience, let's create a JSON file named `.keys.json` in the root directory next to `flow.json` so we can read them later on:

```json

{
    "private": "f410328ecea1757efd2e30b6bc692277a51537f30d8555106a3186b3686a2de6",
    "public": "be393a6e522ae951ed924a88a70ae4cfa4fd59a7411168ebb8330ae47cf02aec489a7e90f6c694c4adf4c95d192fa00143ea8639ea795e306a27e7398cd57bd9"
}

```

After you have taken down the keys, type this command, replacing `<PUBLIC_KEY>` with the public key you generated to create a new account:

```shell

$ flow accounts create --key <PUBLIC_KEY> --signer emulator-account

```

Here is the output:

```

Transaction ID: b19f64d3d6e05fdea5dd2ac75832d16dc61008eeacb9d290f153a7a28187d016

Address	 0xf3fcd2c1a78f5eee
Balance	 0.00100000
Keys	 1

// ...

```

Take note of the new address, which should be different from the one shown here. Also, you might notice there is a transaction ID returned. Creating an account is also a transaction, and it was signed by the `emulator-account` (hence, `--signer emulator-account` flag).

Before we can use the new address, we need to tell the Flow project about it. Open the `flow.json` configuration file, and at the "accounts" field, add the new account name ("test-account" here, but it could be any name), address, and the private key:

```
{
    // ...

    "accounts": {
        "emulator-account": {
            "address": "f8d6e0586b0a20c7",
            "key": "bd7a891abd496c9cf933214d2eab26b2a41d614d81fc62763d2c3f65d33326b0"
        },
        "test-account": {
            "address": "0xf3fcd2c1a78f5eee",
            "key": <PRIVATE_KEY>
        }
    }

    // ...
}

```

With this new account created, we are ready to move on to the next step.

Before we can deposit a token to the new account, we need it to "initialize" its collection. We can do this by creating a transaction for every user to initialize an `NFTCollection` in order to receive NFTs.

Inside `/transactions` directory next to `MintToken.cdc`, create a new Cadence file named `InitCollection.cdc` with the follow code:

```cadence

// InitCollection.cdc

import PetStore from 0xf8d6e0586b0a20c7

// This transaction will be signed by any user account who wants to receive tokens.
transaction {
    prepare(acct: AuthAccount) {
        // Create a new empty collection for this account
        let collection <- PetStore.NFTCollection.new()

        // store the empty collection in this account storage.
        acct.save<@PetStore.NFTCollection>(<-collection, to: /storage/NFTCollection)

        // Link a public capability for the collection.
        // This is so that the sending account can deposit the token to this account's
        // collection by calling its `deposit(token: @NFT)` method.
        acct.link<&{PetStore.NFTReceiver}>(/public/NFTReceiver, target: /storage/NFTCollection)
    }
}

```

This small code will be signed by a receiving account to create an `NFTCollection` instance and save it to their own private `/storage/NFTCollection` domain (Recall that anything stored in `/storage` domain can only be accessible by the current account). In the last step, we linked the `NFTCollection` we have just stored to the public domain `/public/NFTReceiver` (and in the process, "casting" the collection up to `NFTReceiver`) so whoever is sending the token can access this and call `deposit(token: @NFT)` on it to deposit the token.

Try sending this transaction by typing the command:

```shell

$ flow transactions send src/flow/transaction/InitCollection.cdc --signer test-account

```

Note that `test-account` is the name of the new account we created in the `flow.json` file. Hopefully, the new account should now have an `NFTCollection` created and ready to receive tokens!

Now, create a Cadence file named `TransferToken.cdc` in the `/transactions` directory with the following code.

```cadence

// TransferToken.cdc

import PetStore from 0xf8d6e0586b0a20c7

// This transaction transfers a token from one user's
// collection to another user's collection.
transaction(tokenId: UInt64, recipientAddr: Address) {

    // The field holds the NFT as it is being transferred to the other account.
    let token: @PetStore.NFT

    prepare(account: AuthAccount) {

        // Create a reference to a borrowed `NFTCollection` capability.
        // Note that because `NFTCollection` is publicly defined in the contract, any account can access it.
        let collectionRef = account.borrow<&PetStore.NFTCollection>(from: /storage/NFTCollection)
            ?? panic("Could not borrow a reference to the owner's collection")

        // Call the withdraw function on the sender's Collection to move the NFT out of the collection
        self.token <- collectionRef.withdraw(id: tokenId)
    }

    execute {
        // Get the recipient's public account object
        let recipient = getAccount(recipientAddr)

        // This is familiar since we have done this before in the last `MintToken` transaction block.
        let receiverRef = recipient.getCapability<&{PetStore.NFTReceiver}>(/public/NFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")

        // Deposit the NFT in the receivers collection
        receiverRef.deposit(token: <-self.token)

        // Save the new owner into the `owners` dictionary for look-ups.
        PetStore.owners[tokenId] = recipientAddr
    }
}

```

Recall that in the last steps of our `MintToken.cdc` code, we were saving the minted token to our account's `NFTCollection` reference stored at `/storage/NFTCollection` domain.

Here in `TransferToken.cdc`, we are basically creating a sequel of the minting process. The overall goal is to move the token stored in the sending source account's `NFTCollection` to the receiving destination account's `NFTCollection` by calling `withdraw(id: UInt64)` and `deposit(token: @NFT)` on the sending and receiving collections, respectively. Hopefully, by now it shouldn't be too difficult for you to follow along with the comments as you type down each line.

Two new things that are worth noting are the first line of the `execute` block where we call a special built-in function `getAccount(_ addr: Address)`, which return an `AuthAccount` instance from an address passed as an argument to this transaction, and the last line, where we update the `owners` dictionary on the `PetStore` contract with the new address entry to keep track of the current NFT owners.

Now, let's test out `TransferToken.cdc` by typing the command:

```shell

$ flow transactions send src/flow/transaction/TransferToken.cdc 1 0xf3fcd2c1a78f5eee

```

Recall that the `transaction` block of `TransferToken.cdc` accepts two arguments--A token ID and the recipient's address--which we passed as a list of arguments to the command. Some of you might wonder why we left out `--signer` flag for this transaction command, but not the other. Without passing the signing account's name to `--signer` flag, the contract owner's account is the signer by default (a.k.a the `AuthAccount` argument in the `prepare` block).

Hopefully, you should see an output similar to this:

```shell

Transaction ID: 4750f983f6b39d87a1e78c84723b312c1010216ba18e233270a5dbf1e0fdd4e6

Status		✅ SEALED
ID		    4750f983f6b39d87a1e78c84723b312c1010216ba18e233270a5dbf1e0fdd4e6
Payer		f8d6e0586b0a20c7
Authorizers	[f8d6e0586b0a20c7]

// ...

```

Well done! You have just withdrawn and deposited your an NFT to another account!

### `GetTokenOwner` script

We have learned to write and send transactions. Now, we will learn how to create scripts to read state from the blockchain.

There are many things we can query using a script, but since we have just transferred a token to `test-account`, it would be nice to confirm that the token was actually transferred.

Let's create a script file named `GetTokenOwner.cdc` under the `script` directory. As you can see it is quite straightforward:

```cadence

// GetTokenOwner.cdc

import PetStore from 0xf8d6e0586b0a20c7

// All scripts start with the `main` function,
// which can take an arbitrary number of argument and return
// any type of data.
//
// This function accepts a token ID and returns an Address.
pub fun main(id: UInt64): Address {

    // Access the address that owns the NFT with the provided ID.
    let ownerAddress = PetStore.owners[id]!
    return ownerAddress
}

```

All scripts have an entry function called `main`, which can take any number of arguments and return any data type.

This script simply accesses the `owners` dictionary in the `PetStore` contract using the token ID and returns the address of the token's owner, or fail if the value is `nil`.

It's worth repeating myself this: Scripts do not require any gas fee and authorization. They are just programs that reads public data on the blockchain.

Executing a script with Flow CLI is also pretty straightforward:

```shell

$ flow scripts execute src/flow/script/GetTokenOwner.cdc <TOKEN_ID>

```

`<TOKEN_ID>` is an unsigned integer token ID starting from 1. If you have [minted an NFT](#minttoken-transaction) and [transferred it to the `test-account`](#transfertoken-transaction), then replace `<TOKEN_ID>` with the token ID. You should get back the address of the `test-account` you have created.

### `GetTokenMetadata` script

From `GetTokenOwner.cdc` script, it takes only a few more steps to create a script that returns a token's metadata.

We will work on `GetTokenMetadata.cdc` which, as the name suggests, get the metadata of an NFT based on the given ID.

Recall that there is a `metadata` variable in the `NFT` resource definition in the contract which stores a `{String: String}` dictionary of that `NFT`'s metadata. Our script will have to query the right `NFT` and read the variable.

Because we already know how to get an NFT's owner address, all we have to do is to access `NFTReceiver` capability of the owner's account and call `getTokenMetadata(id: UInt64) : {String: String}` on it to get back the NFT's metadata.

```cadence

// GetTokenMetadata.cdc

import PetStore from 0xf8d6e0586b0a20c7

// All scripts start with the `main` function,
// which can take an arbitrary number of argument and return
// any type of data.
//
// This function accepts a token ID and returns a metadata dictionary.
pub fun main(id: UInt64) : {String: String} {

    // Access the address that owns the NFT with the provided ID.
    let ownerAddress = PetStore.owners[id]!

    // We encounter the `getAccount(_ addr: Address)` function again.
    // Get the `AuthAccount` instance of the current owner.
    let ownerAcct = getAccount(ownerAddress)

    // Borrow the `NFTReceiver` capability of the owner.
    let receiverRef = ownerAcct.getCapability<&{PetStore.NFTReceiver}>(/public/NFTReceiver)
        .borrow()
            ?? panic("Could not borrow receiver reference")

    // Happily delegate this query to the owning collection
    // to do the grunt work of getting its token's metadata.
    return receiverRef.getTokenMetadata(id: id)
}

```

Now, execute the script:

```shell

$ flow scripts execute src/flow/script/GetTokenMetadata.cdc <TOKEN_ID>

```

If we have minted an NFT with the metadata `{"name": "Max", "breed": "Bulldog"}` in the [previous minting step](#minttoken-transaction), then that is what you will get after running the script.

Et voila! You have come very far and dare I say you are ready to start building your own Flow NFT app.

However, user experience is a crucial part in any app. It is more than likely that your users won't be as proficient at the command line as you do. Moreover, it is a bit boring for an NFT store to have faceless NFTs. In the next section, we will start tackling the fun part--building the UI on top and using [nft.storage][nft-storage] service to upload and store images of our NFTs.

### Front-end app

> **💡 Do you know React?**    
> In this part of the tutorial, we will work with React.js extensively.
> Because learning React is unfortunately out of the scope, if you think
> you will need some introduction or brush-up on React, please head over
> to [Intro to React][react-intro] tutorial before returning here.

Our NFT pet store is fully functional at the command line, but without a face, it is too hard for end users to use.

Very often, especially for [decentralized applications][dapps] whose back-ends rely heavily on blockchains and other decentralized technology, the user experience is what makes or breaks them. Quite often, the user-facing part *is* the only crucial part in a dapp.

In this section, we will be working on the UI for the pet store app in React.js. While you're expected to have some familiarity with the library, I will do my best to use common features instead of trotting into advanced ones.

### Setting up

Make sure you are in the project directory (next to `package.json`). Install the following packages:

```shell

$ npm install --save @onflow/fcl @onflow/types nft.storage

```

The Flow packages will help in connecting our React app to the Cadence code. The `nft.storage` package will help in uploading the image during minting and retrieving data from Filecoin/IPFS network. In order to do so, you will need to [sign up][nft-storage] and generate an API key. After you have signed up, navigate to the "API Keys" tab, and click to create a new key, as shown here:

![Screenshot of NFT.Storage API Keys page](./images/flow-nft-marketplace/nft-storage-api-keys.png)

Take down the key as we will need it later on when we work on the [minting logic](#minting-logic).

Also, to get styling out of the way, please download [Skeleton CSS][skeleton-css-download] and unzip all the CSS files into the `src` directory. Then, in the `App.css` stylesheet, after the last line, import all the stylesheets you just unzipped with:

```css

/* App.css */

@import "./skeleton.css";
@import "./normalize.css";

/* import all other CSS files if any */

```

Because we want to focus on the UI integration, I'll tell you when to just copy the code that isn't important.

Run the app with `npm run start`, the React app should open in the browser on `http://localhost:3000`. Keep the browser open to see the updates as you save your progress.

In your editor, open `App.js` and remove all the current HTML, leaving only the `<div className="App">` level.

```jsx

function App() {
  return (
    <div className="App">
        {/* Remove this code */}
    </div>
  );
}

```

After you save the file, the app in the browser should become blank.

Now, create a new directory named `components` inside `src` to keep our reusable components.

Inside the newly created directory, create a new file named `Form.js`. This will be a form component that will allow users to submit and mint new NFTs.

```jsx

// components/Form.js

import FileSelector from './FileSelector';

// Collect the information of a pet and manage as a state
// and mint the NFT based on the information.
const Form = () => {
  const [pet, setPet] = useState({});

  // Helper functions to be passed to input elements' onChange.

  const setName = (event) => {
    const name = event.target.value;
    setPet({...pet, name});
  }

  const setBreed = (event) => {
    const breed = event.target.value;
    setPet({...pet, breed});
  }

  const setAge = (event) => {
    const age = event.target.value;
    setPet({...pet, age});
  }

  return (
    <div style={style}>
      <form>
        <div className="row">
            <FileSelector pet={pet} setPet={setPet} />
            <div>
            <label for="nameInput">Pet's name</label>
            <input
              className="u-full-width"
              type="text"
              placeholder="Max"
              id="nameInput"
              onChange={setName}
            />
            </div>
            <div>
            <label for="breedInput">Breed</label>
            <select className="u-full-width" id="breedInput" onChange={setBreed}>
              <option value="Labrador">Labrador</option>
              <option value="Bulldog">Bulldog</option>
              <option value="Poodle">Poodle</option>
            </select>
            </div>
            <div>
            <label for="ageInput">Age</label>
            <select class="u-full-width" id="ageInput" onChange={setAge}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            </div>
        </div>
        <input className="button-primary" type="submit" value="Mint" />
      </form>
    </div>
  );
};

const style = {
  padding: '5rem',
  background: 'white',
  maxWidth: 350,
};

export default Form;

```

The `FileSelector.js` component we imported does not yet exist. So, next to `Form.js`, create another component named `FileSelector.js` to handle the image upload logic.

```jsx

// components/FileSelector.js

import { useState } from 'react';

// We are passing `pet` and `setPet` as props to `FileSelector` so we can
// set the file we selected to the pet state on the `Form` outer scope
// and keep this component stateless.
const FileSelector = ({pet, setPet}) => {

  // Read the FileList from the file input component, then
  // set the first File object to the pet state.
  const readFiles = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setPet({...pet, file: files[0]});
    }
  };

  return (
    <div className="">
      <label for="fileInput">Image</label>
      {/* Add readFiles as the onChange handler. */}
      <input type="file" onChange={readFiles} />
    </div>
  );
};

export default FileSelector;

```

If you import `Form.js` component into `App.js` and insert it anywhere inside the main `App` container, you should see your form that looks similar to the one you see below:

  ![Screenshot of form component](./images/flow-nft-marketplace/form.png)


> **💡 How I write code**    
> The way I write code is to write very small unit at a time, then
> test that it works as intended, then if it might be reusable, wrap
> it in a function. Then I repeat.
>
> This makes perfect sense. The more code we write, the harder it is 
> to debug and go back to fix something. It is always better to write > less code in general.
>
> Here, I would include `console.log()` in each event handler, then
> test clicking the form to make sure the logged values are what I
> expected before moving on.

## Minting logic

Here comes the interesting part. We will hook up the `Mint` button to actually mint a token based on user's input!

Switching gears here, let's head over to `/src/flow/transaction` and create a new JavaScript file named `MintToken.tx.js`.

This module will send the Cadence transaction `MintToken.cdc` similarly to how we have used Flow CLI to do so previously.

```js

// MintToken.tx.js

// Minting module here

```








## WIP

[vscode]: https://code.visualstudio.com/
[vscode-cdc-ext]: https://docs.onflow.org/vscode-extension/
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
[cdc-dict-type]: https://docs.onflow.org/cadence/language/values-and-types/#dictionaries
[cdc-force-unwrap]: https://docs.onflow.org/cadence/language/values-and-types/#force-unwrap-
[cdc-array-type]: https://docs.onflow.org/cadence/language/values-and-types/#array-types
[cdc-optional-type]: https://docs.onflow.org/cadence/language/values-and-types/#optionals
[cdc-address-type]: https://docs.onflow.org/cadence/language/values-and-types/#addresses
[cdc-comp-type]: https://docs.onflow.org/cadence/language/composite-types/
[cdc-integer-type]: https://docs.onflow.org/cadence/language/values-and-types/#integers
[cdc-force-assign]: https://docs.onflow.org/cadence/language/values-and-types/#force-assignment-operator--
[cdc-domain]: https://docs.onflow.org/cadence/tutorial/02-hello-world/#account-filesystem-domain-structure-where-can-i-store-my-stuff
[react-intro]: https://reactjs.org/tutorial/tutorial.html
[cdc-reference]: https://docs.onflow.org/cadence/language/references/
[nft-storage]: https://nft.storage/
[dapps]: https://ethereum.org/en/dapps/
[skeleton-css-download]: https://github.com/dhg/Skeleton/releases/download/2.0.4/Skeleton-2.0.4.zip
<ContentStatus />
