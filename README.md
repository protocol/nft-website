# NFT School

## Project setup

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai)
[![](https://img.shields.io/badge/platform-VuePress-green.svg)](https://vuepress.vuejs.org/)
[![](https://img.shields.io/badge/deployed%20on-Fleek-ff69b4.svg)](http://fleek.co/)


This repository contains code and content for the [NFT School](https://nftschool.dev) website, an open-source community education platform devoted to best practices, concept guides, tutorials, and how-tos for developers in the non-fungible token (NFT) space. 

**Contributions are more than welcome!** As an open-source project, this site relies on people like you to suggest, create, and improve content to make the NFT developer experience better for everyone. To get started ...

- Check this repo's [issues page](https://github.com/protocol/nft-website/issues) to see what items are in need of help, including content request issues looking for writers.
- If you're writing something new, read through the [contribution guide](https://nftschool.dev/contribute/) for guidelines on types of content, grammar, formatting, and style.
- For details on building the site locally and submitting pull requests, see the ["For site developers"](#for-site-developers) section below.

## For site developers

### Build and run locally

This site is built in [Vuepress](https://vuepress.vuejs.org/guide/), and uses Vue/JavaScript for functional code and Markdown for post content.

To build a local copy, run the following:

1. Clone this repository:

   ```bash
   git clone https://github.com/protocol/nft-website.git
   ```

1. Move into the `nft-website` folder and install the NPM dependencies:

   ```bash
   cd nft-website
   npm install
   ```

1. Boot up the application in _dev mode_:

   ```bash
   npm start
   ```

1. Open [localhost:8080](http://localhost:8080) in your browser.
1. Close the local server with `CTRL` + `c`.
1. To restart the local server, run `npm start` from within the `nft-website` folder.

### PR and preview

Once you're happy with your local changes, please make a PR **against the `main` branch**. Including detailed notes on your PR - particularly screenshots to depict any changes in UI - will help speed up approval and deployment.

All PRs against `main` automatically generate Fleek previews to make it easier to "check your work". You can view your PR's preview by clicking `Details` in the `fleek/build` check at the bottom of your PR page:<br/>
![image](https://user-images.githubusercontent.com/1507828/110034382-9dbb5b80-7cf7-11eb-89a4-7772970677d3.png)

A reviewer will be by shortly to have a look!

## Maintainers

This site's codebase is under active maintenance by members of the core team at [Protocol Labs](https://protocol.ai/).

## License

All software code is copyright (c) Protocol Labs, Inc. under the **[MIT](LICENSE) license**. Other written documentation and content is copyright (c) Protocol Labs, Inc. under the [**Creative Commons Attribution-Share-Alike License**](https://creativecommons.org/licenses/by/4.0/).
