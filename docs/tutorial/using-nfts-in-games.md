---
title: Using NFTs in games
description: A tutorial on writing your own game. Part 1 - Stores, Packs and Cards
related:
  'Guide to NFTs, DeFi, and Gaming (Hackernoon)': https://hackernoon.com/everything-you-need-to-know-about-nfts-defi-and-gaming-rbm335n
  'NFTs: The Next Gaming Revolution? (Ledger)': https://www.ledger.com/academy/nfts-the-next-gaming-revolution
---

In this tutorial we will be working creating an NFT game from the start to finish. The initial parts will focus on solidity and hardhat for developing our smart contracts and writing tests, yes, lots of tests. 

I know that doesn't sound super fun, you want to be creating all sorts of ape images and making millions on OpenSea but we have to crawl before we can bound like an Ape.

## Requirements for you, the developer

You need to have somewhat of a grasp on javascript, hardhat and solidity. The code should explain a lot but if you get stuck or aren't sure about what the codes doing exactly looking at references on the respective sites should help you. There are also excellent discord servers for most things as well to help you upskill.

This is not a super easy introduction to solidity, there will be no hello world or simple storage counter smart contracts here, if it seems quite complex at first, just keep persevering. You'll get there. Even I did.

On your computer your gonna need a good shell (ZSH), node installed and hardhat etc and a copy of the repo for this project (TBA). You can use VSCode or Jetbrains IDE's with javascript support (Intellij/WebStorm) if your that way inclined. I use both, I like Intellij's debugging and TS intellisense but the testing and plugins for solidity are better in VSCode, so thems the breaks. I use a mac to develop on, you should be fine with WSL2 on windows but your own your own if you have problems, sorry. Linux will be fine too.

## The outline

Ok, so this tutorial will outline the design and creation of a game, Battle Royale (TBC), that allows you to fight PVE (Player v's Enemy) a computer based opponent and maybe another player (stretch goal). We will have the ability to buy a pack of cards and inside that pack you will get a character, a weapon, a skill, and a shield. They all have stats on them, so we need to have the ability to store that onchain and you make a player loadout from these cards to then battle an opponent to win lose. What you win/lose at this point will just be the battle itself and will add to your stats as a player but we could win some prize, another NFT etc but the general rules of the game are the same. So lets keep it simple to begin with.

## The Components: 1. Battle Cards NFTs

The first component we need to think about is the Battle Cards, these are the cards we are going to use in the game. They are quite simple, they have a specific class (`CHARACTER`, `WEAPON`, `SKILL`, `SHIELD`) and a `value` field which holds the value/statistic for that specific class. This is held on chain, so we can use it in the smart contract game. The rest of the stats like name, image etc will be held off chain in a json metadata file and card image stored on an IPFS platform like [`NFT.storage`](https://nft.storage/#docs). For the first part of the game we are only going to work with the solidity side of things and test that, the images and upload of the images/metadata can come later on.

## The Components: 2. Battle Card Packs NFTs

The second component we have is card packs. These are akin to buying a pack of Pokemon or MGT cards wrapped in foil. You have some cards in there but you don't know what they are! So we want to have that same kind of excitement when you buy into the game. We will also want to have the ability to have these packs as NFT's in their own right. You might want to keep a pack or two unopened to trade or keep or you might just want to open them then and there. Our design will cater for both options.

## The Components: 3. The Card Pack Store

This component is the final component we will work on in this initial phase of the tutorial. This smart contract contains the logic for buying packs and opening them. It's got a few moving parts so we will go through this one in some detail but by the end you will have a way for people to buy your packs, be given a pack NFT or if they decide to open them it will mint you some Battle Card NFTs based on some probabilities we are going to code into the system.

## The Overall Requirements/Design Specification

The above components are a high level overview of the components but we probably need to take a step back and understand how we came to this design. The main idea of this game is to have a battle royale game where people can compete against others/computer opponents and win/lose. That's it in essence, but how do we get there?

You need to think about how you actually compete against another person. Generally, we need to win or lose based on some basic things, you need to have some kind of statistics/values to pit yourself against another and then some probability/chance you going to win lose. Thats how card games work and we are trying to emulate that behaviour on the blockchain. It's not much different than blackjack where you have a hand of cards up to the value 21 and you are competing against another player. Your hand of cards is the statistics and the chance is you may have a strong hand but is the other persons hand stronger?

### How we actually battle

So we have to think about how we do that in this game. You will have a hand of cards (4 in this game) that give you a set of values, your total score. This could look like the following example:

* Character: `50/125`
* Weapon: `60/125`
* Skill: `90/125`
* Shield: `80/125`

Total score: `280/500`

What does the `/125` mean? Lets imagine that we have a maximum stat value of 500 across all 4 cards. This will make things easier later on. So your stats can be from `1` to `125` and when you sum them all up thats your characters score.

### Our Initial Design for the Card NFT

So this number from above becomes our score/stats that we will be using to pit ourselves against others. So each card needs to have a `value` this stat and a `class` which designates what kind of card it is. Essentially thats all we need right now.

So that gives us a rough idea of what we would like our smart contract for the NFT Card to store.

```javascript
contract BattleRoyaleCardNFT is NFT {
    // these would be the values each card will store
    uint8 value;
    CardType type;
    
    // And this is the enumeration of CardTypes:
    enum CardType {
        character,
        weapon,
        skill,
        shield
    }

    // ... lots of other stuff I guess
}
```

Now that isn't 100% correct but its kind of the thing we want to have in the card, it will look a lot different by the end but something like this lets us at least understand in pseudo code what we are after. We also need to decide on what kind of NFT we want to have here, ERC721 or ERC155. We will discuss that later.

### Our Initial Design for the Card NFT hands

So now we have a card with some stats, we need to then take 4 of these cards and play them in a hand, we need to only be able to play one of each class in a hand so our game contract has to be able to discern the card type `type` in the `BattleRoyaleCardNFT` above. After all we don't want someone to play with 4 character cards and cheat. So our game contract will use these values when it comes to playing a round of the game.

### Our Initial Design for the Card Packs

Our card packs are a little more complicated. We need to have the ability to have multiple pack types. We want to sell our packs of 4 cards in multiples of 1,3,10, and 36. So obviously we need to price them, have a quantity of packs to open inside them. We also would like to add in a limit of packs we mint. The reason being we could introduce the concept of generations of cards. Our first generation of cards might only be 10,000 (which seems to be the derigeur number for minting NFTs). Once this limit was hit we would then stop minting this generation of cards and then either stop or move the next generation. This is quite complex but we will code the initial code that will handle a limit to minting packs. You'll see as this progresses its simple logic but the testing needs to be quite comprehensive to ensure it works correctly.

### Our Initial Design for the Store

The store wires all this together. We need to have the ability for people to buy these packs, pay their money, and either get an NFT of the packs they purchased or a collection of NFT's depending on what pack they selected/purchased. This has to know the limits of the packs, be able to talk to both NFT contracts to mint them/burn them etc. It also has to be able to open packs using some kind of randomness because we don't want to make all cards appear the same, there might be rarer cards that have higher values/stats and we wouldn't want them to appear as often as the lower valued cards.

### Rarity

Rarity came up as an idea on this cycle of design. So like most card games not all cards appear in the same frequency. We need to figure out how many cards in each type we have created and then decide which ones are higher valued than others and then make them more rare by saying the chance of them appearing is less than others.

So lets adjust our contract to have the concept of rarity:

```javascript
contract BattleRoyaleCardNFT is NFT {
    // these would be the values each card will store
    uint8 value;
    CardType type;
    CardRarity rarity;

    // And this is the enumeration of CardTypes:
    enum CardType {
        character,
        weapon,
        skill,
        shield
    }

    enum CardRarity {
        common,
        uncommon,
        rare,
        ultra,
        mythic
    }
    // ... lots of other stuff I guess
}
```

So something like this on the card side. We need to then think about how we capture this in the Store. Because really the pack doesn't care about the card types, probabilities etc, it's just the promise of some cool stuff, the actual creation of the cool stuff isn't happening in the `BattleRoyaleCardPackNFT`. Its happening in the `BattleRoyaleStore` contract.

### `BattleRoyaleStore` contract

Lets start with our prototype `BattleRoyaleStore` contract. It has to have the following structure methods from what we understand so far.

```javascript

// we will be using open zeppelin contracts for these bits (AccessControlEnumerable, Pausable), don't sweat these details right now...
contract BattleRoyaleStore is AccessControlEnumerable, Pausable {

    // These are our pack types.
    enum CardPackType {
        PACK_01,
        PACK_03,
        PACK_10,
        PACK_36
    }

    /**
     * @dev - Method to buy some packs or open them.
     * @notice Will create a pack of type `packId` and will either open the pack or give you an NFT.
     *
     * @param packId - the id of the pack we want to open up.
     * @param openPack - if true we give them a CardPackNFT, if not they get their CardNFTs
     */
    function buyPack(CardPackType packId, bool openPack) public payable {
      // buy a pack
    }

}

```

So this is what we think we are going to need right now conceptually.

[MORE TO COME]
