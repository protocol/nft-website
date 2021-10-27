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

    // An array that stores NFT owners
    pub var owners: {UInt64: Address}

    // Constructor method
    init() {
        self.owners = {}
    }

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

    access(self) resource NFTMinter {

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

As we wrap up writing our `PetStore` contract, you can try to deploy it to Flow emulator (local net) to verify that the contract is correct. Check `flow.json` file and verify that the following two fields are set as the following:

```
{
    // ...

    "contracts": {
        "PetShopContract": "./src/flow/contracts/PetStore.cdc"
    },

    "deployments": {
		"emulator": {
			"emulator-account": ["PetStore"]
		}
	},

    // ...
}

```

Then, run the Flow cli command to start the emulator and deploy your first contract!

```shell

# Start the emulator
$ flow emulator

# In another shell, deploy the contract
$ flow project deploy

```

If all went well, you should receive a nice happy message informing you that your contract was deployed.

### `MintToken` transaction

The first and most important transaction for *any* NFT app is perhaps the one that mints tokens into existence! Without it there won't be any cute tokens to sell and trade. So let's start coding:

```cadence

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
    prepare(acct: AuthAccount) {

        // Note that we have to call `getCapability(_ domain: Domain)` on the account
        // object before we can `borrow()`.
        self.receiverRef = acct.getCapability<&{PetStore.NFTReceiver}>(/public/NFTReceiver)
            .borrow()
            ?? panic("Could not borrow receiver reference")

        // With an authorized reference, we can just `borrow()` it.
        // Note that `NFTMinter` is borrowed from `/storage` domain namespace, which
        // means it is only accessible to this account.
        self.minterRef = acct.borrow<&PetStore.NFTMinter>(from: /storage/NFTMinter)
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

The first line of the transaction code imports the `PetStore` contract instance.

The `transaction` block takes an arbitrary number of named parameters, which will be provided by the calling program (In Flow CLI, JavaScript, Go, or other language). These parameters are the only channels for the transaction code to interact with the outside world.

Next, we declare references `&{NFTReceiver}` and `&NFTMinter` (Note the first is an unauthorized reference).

Now we enter the `prepare` block, which is responsible for authorizing the transaction. This block takes an argument of type `AuthAccount`. This account instance is required to sign and validate the transaction with its key. If it takes more than one `AuthAccount` parameters, then the transaction becomes a *multi-signature* transaction. This is the only place our code can access the account object.

What we did was calling `getCapability(/public/NFTReceiver)` on the account instance, then `borrow()` to borrow the reference to `NFTReceiver` and gain the capability for `receiverRef` to receive tokens. We also called `borrow(from: /storage/NFTMinter)` on the account to enable `minterRef` with the superpower to mint tokens into existence.

The `execute` block runs the code within after the `prepare` block succeeds. Here, we called `mint(metadata: {String: String})` on the `minterRef` reference, then moved the newly created `@NFT` instance into a `newToken` variable. After, we called `deposit(token: @NFT)` on the `receiverRef` reference, passing `<-newToken` (`@NFT` resource) as an argument. The newly minted token is now stored in our account's `receiverRef`. That concludes our minting transaction!

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
 [cdc-dict-type]: https://docs.onflow.org/cadence/language/values-and-types/#dictionaries
 [cdc-force-unwrap]: https://docs.onflow.org/cadence/language/values-and-types/#force-unwrap-
 [cdc-array-type]: https://docs.onflow.org/cadence/language/values-and-types/#array-types
 [cdc-optional-type]: https://docs.onflow.org/cadence/language/values-and-types/#optionals
 [cdc-address-type]: https://docs.onflow.org/cadence/language/values-and-types/#addresses
 [cdc-comp-type]: https://docs.onflow.org/cadence/language/composite-types/
 [cdc-integer-type]: https://docs.onflow.org/cadence/language/values-and-types/#integers
 [cdc-force-assign]: https://docs.onflow.org/cadence/language/values-and-types/#force-assignment-operator--
 [cdc-domain]: https://docs.onflow.org/cadence/tutorial/02-hello-world/#account-filesystem-domain-structure-where-can-i-store-my-stuff
 [cdc-reference]: https://docs.onflow.org/cadence/language/references/
<ContentStatus />
