---
title: Lazy minting
description: Learn what's meant by lazy-minting NFTs, and how and when to do it.
---

# Lazy minting

Minting an NFT on a blockchain _mainnet_ generally costs some amount of money, since writing data onto the blockchain requires a fee (often called _gas_) to pay for the computation and storage. This can be a barrier for NFT creators, especially those new to NFTs who may not want to invest a lot of money up front before knowing whether their work will sell.

Using a few advanced techniques, it's possible to defer the cost of minting an NFT until the moment it's sold to its first buyer. The gas fees for minting are rolled into the same transaction that assigns the NFT to the buyer, so the NFT creator never has to pay to mint. Instead, a portion of the purchase price simply goes to cover the additional gas needed to create the initial NFT record.

Minting "just in time" at the moment of purchase is often called _lazy minting_, and it has been [adopted by marketplaces like OpenSea](https://opensea.io/blog/announcements/introducing-the-collection-manager/) to lower the barrier to entry for NFT creators by making it possible to create NFTs without any up-front costs.

This guide will show an example of lazy minting on Ethereum, using some helper libraries and base contracts from [OpenZeppelin](https://openzeppelin.com/contracts/). If you're new to minting NFTs in general, our [minting service tutorial](../../tutorial/minting-service.md) is a great place to get up to speed on the basics.

Throughout the guide, we'll be referring to an example project, which lives in the [NFT School examples repository](https://github.com/ipfs-shipyard/nft-school-examples). If you want to dig in, clone the repo and open the example in your favorite editor:

```bash
git clone https://github.com/ipfs-shipyard/nft-school-examples
cd nft-school-examples/lazy-minting
code . # or whichever editor you prefer
```

## How it works

The basic premise of lazy minting is that instead of creating an NFT directly by calling a contract function, the NFT creator prepares a cryptographic signature of some data using their Ethereum account's private key.

The signed data acts as a "voucher" or ticket that can be redeemed for an NFT. The voucher contains all the information that will go into the actual NFT, and it may optionally contain additional data that isn't recorded in the blockchain, as we'll see in a bit when we talk about prices. The signature proves that the NFT creator authorized the creation of the specific NFT described in the voucher.

When a buyer wants to purchase the NFT, they call a `redeem` function to redeem the signed voucher. If the signature is valid and belongs to an account that's authorized to mint NFTs, a new token is created based on the voucher and transfered to the buyer.

For our example, we're using a [Solidity `struct`](https://docs.soliditylang.org/en/v0.4.24/types.html#structs) to represent our voucher:

```solidity
struct NFTVoucher {
  uint256 tokenId;
  uint256 minPrice;
  string uri;
  bytes signature;
}
```

The voucher contains two pieces of information that will be recorded into the blockchain: the unique `tokenId`, and the `uri` for the token's metadata. The `minPrice` is not recorded, but it is used in our `redeem` function to allow the creator to set a purchase price. If the `minPrice` is greater than zero, the buyer will need to send at least that much Ether when they call `redeem`.

The `signature` field in our struct contains a signature prepared by the NFT creator as described [in the next section](#creating-a-signed-voucher).

::: tip
Setting a purchase price inside the voucher isn't always necessary, but you will probably need some kind of condition. Otherwise, anyone who has the voucher could claim the NFT for just the gas cost! 

For example, if you're "air-dropping" NFTs to specific accounts and know the recipient addresses up front, your voucher could include an `address recipient` field instead of a `minPrice`, and your `redeem` function could check to make sure that `msg.sender == voucher.recipient`.
:::

## Creating a signed voucher

Using signatures for authorization can be tricky, since a sneaky third party could potentially take some data that was signed in one context and present it somewhere else. For example, they may take a signature authorizing the creation of an NFT on the Ropsten testnet and present it to a contract deployed on mainnet. Unless the data being signed contains some context information, this kind of "replay attack" is fairly trivial to perform and hard to defend against.

To address these concerns and also provide a better user experience when signing messages, the Ethereum community has developed [EIP-712](https://eips.ethereum.org/EIPS/eip-712), a standard for signing typed, structured data. Signatures created with EIP-712 are "bound" to a specific instance of a smart contract running on a specific network. They also contain type information, so that tools like [MetaMask](https://metamask.io/) can present more details about the data being signed to the user instead of an opaque string of hex characters.

Our example uses a JavaScript class called `LazyMinter` to prepare signed vouchers using EIP-712. Because the signatures are bound to a specific contract instance, you need to provide the address of the deployed contract and an ethers.js [`Signer`](https://docs.ethers.io/v5/api/signer/) for the NFT creator's private key:

```js
const lazyminter = new LazyMinter({ myDeployedContract.address, signerForMinterAccount })
```

Here's the main `createVoucher` method that creates signed NFT vouchers:

```js
  async createVoucher(tokenId, uri, minPrice = 0) {
    const voucher = { tokenId, uri, minPrice }
    const domain = await this._signingDomain()
    const types = {
      NFTVoucher: [
        {name: "tokenId", type: "uint256"},
        {name: "minPrice", type: "uint256"},
        {name: "uri", type: "string"},  
      ]
    }
    const signature = await this.signer._signTypedData(domain, types, voucher)
    return {
      ...voucher,
      signature,
    }
  }
```

First we prepare our unsigned `voucher` object and get the _signing domain_ to use for EIP-712. The `types` object contains the type information for our `NFTVoucher`'s fields (excluding the signature itself).

To create the signature, we call the `_signTypedData` method on our `Signer` object, passing in the domain, type definition, and the unsigned voucher object.

Finally, we return the full voucher object with the signature included, which can be redeemed in our smart contract.

::: warning
The `_signTypedData` method will be renamed to `signTypedData` in a future version of ethers.js! See [the ethers docs for more info](https://docs.ethers.io/v5/api/signer/#Signer-signTypedData).
:::

## Redeeming a voucher on-chain

For lazy minting to work, we need a smart contract function that the NFT buyer can call that will both mint the NFT they want and assign it to their account, all in one transaction. Ours is called `redeem`:

```solidity
  function redeem(address redeemer, NFTVoucher calldata voucher) public payable returns (uint256) {
    // make sure signature is valid and get the address of the signer
    address signer = _verify(voucher);

    // make sure that the signer is authorized to mint NFTs
    require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");

    // make sure that the redeemer is paying enough to cover the buyer's cost
    require(msg.value >= voucher.minPrice, "Insufficient funds to redeem");

    // first assign the token to the signer, to establish provenance on-chain
    _mint(signer, voucher.tokenId);
    _setTokenURI(voucher.tokenId, voucher.uri);
    
    // transfer the token to the redeemer
    _transfer(signer, redeemer, voucher.tokenId);

    // record payment to signer's withdrawal balance
    pendingWithdrawals[signer] += msg.value;

    return voucher.tokenId;
  }
```

First we call a `_verify` helper function, which either returns the address of the account that prepared the signature or reverts the transaction if the signature is invalid.

Once we have the signer's address, we check that they're authorized to create NFTs using the `hasRole` function from [OpenZeppelin's role-based AccessControl contract](https://docs.openzeppelin.com/contracts/4.x/access-control).

We also make sure that the buyer has sent enough ETH to cover the `minPrice`. If so, we can create a new token based on the info in the voucher and transfer it to the `redeemer` account.

Finally, we tuck the payment into a mapping called `pendingWithdrawals`, so the NFT creator can get their ETH out later.

That's it! If you're curious about the signature verification, see the [contract source](https://github.com/ipfs-shipyard/nft-school-examples/blob/main/lazy-minting/contracts/LazyNFT.sol) and the [docs for the OpenZeppelin EIP-712 base contract](https://docs.openzeppelin.com/contracts/4.x/api/utils#EIP712).

## Conclusion

Lazy minting is a powerful technique that can let creators issue new NFTs at no up-front cost.

Although we've demonstrated the core technique here, a production platform will need a lot more! For example, you'll likely need an application for NFT creators to issue signed vouchers, and you'll probably want some kind of back-end system to keep track of all the "un-minted" NFTs waiting to be redeemed.

Have fun building, and [let us know](https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=open-an-issue.md&title=%5BPAGE+ISSUE%5D+Lazy%20minting) if there's anything you'd like to see on this page that we haven't covered!
