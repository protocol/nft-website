---
title: Content addressing
description: Understand how content addressing is key to NFT best practices in this developer-focused guide.
---
 # Content addressing

 Content addressing is a technique for organizing and locating data in an information system, where the key used to locate content is derived from the content itself.

 ## The basic problem

 Imagine a key/value store with an interface like the one below:

 ```typescript
// This example uses TypeScript to annotate the parameters and return types of our methods. 
// We won't do any fancy type manipulation though, so don't worry if you're not into TypeScript.
type Key = string;
type Value = string;

interface KVStore {
  put(key: Key, value: Value): Promise<Void>;

  get(key: Key): Promise<Value>;
}
 ```

This basic interface is pretty common for key/value stores. Using `put`, we can associate any `Value` with a `Key`, and later when we need it, we can look the key up with `get` and hopefully get our value back.

When you start to use an interface like this, one of the most important decisions is what to use for the keys. If you're building an application where you control the access patterns, you can use whatever keys you like and keep track of them all in your code, or come up with some rules to map out which keys should be used for which kind data.

Things get more complicated when many uncoordinated parties are all writing to the store at once. With one global key space, either everybody needs to agree on the same rules, or the space needs to be split into many separate "domains" or "name spaces." 

Let's say we have one big K/V store that's shared by thousands or even millions of people, each with their own "domain" in the key space. That mostly solves the write problem - everybody can manage their own keys without needing to coordinate with everyone else.

However, now it's less clear where to look for data when we want to `get` it out again. With each domain following its own rules, it's hard to know what key to use to retrieve things. Also, without coordination between the different domains, you may end up with the same value stored multiple times in different domains, with no easy way to tell that many keys are all pointing to the same value.

If this sounds familiar, consider what happens when you resolve a link like `nftschool.dev/concepts/content-addressing`. First, your operating system will query a global shared key/value store, split into many domains: the Domain Name System. DNS will return an IP address that your network card can use to send HTTP requests over the network, where our site's naming conventions turn the key `/concepts/content-addressing` into a response payload.

The web is basically the definition of "internet scale," so clearly this system works pretty well. So what's the problem?

The real problem is time.

Both components of an address like `nftschool.dev/concepts/content-addressing` are _mutable_, meaning they can change over time. If we forget to pay our bills, the domain can expire and be bought by the highest bidder. Or, if we decide to play fast and loose with our site structure and forget to add redirects, the path `/concepts/content-addressing` may return a 404 instead of this article.

In the context of the web, where _everything_ is mutable and dynamic, this is just the way it's always been. The web has never promised any kind of "permanence" either in content or the "meta-structure" of links between content. As a result, [link rot](https://www.cjr.org/analysis/linkrot-content-drift-new-york-times.php) is just something we've all learned to live with.

## A more stable key


