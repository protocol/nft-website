---
title: Contribution tutorial
description: Learn how to contribute to IPFS documentation through finding issues, fixing them, and submitting them to the project.
---

# Contribution tutorial

While the [grammar, formatting, and style](/community/contribute/grammar-formatting-and-style/) and the [writing guide](/community/contribute/writing-guide/) can both help you write good content for the IPFS Docs project, they don't delve into _how_ you can submit your content changes. This guide will walk you through finding an issue, fixing it, and then submitting your fix to the `ipfs/ipfs-docs` project.

There are plenty of small-sized issues around IPFS documentation that make for easy, helpful contributions to the IPFS project. Here, we'll walk through:

1. Finding an issue.
2. Discussing the issue.
3. Creating a fix.
4. Submitting a _pull request_.
5. Waiting for a review.
6. Merging your fix.

This may look like a lot of steps for a small issue fix, but they're all necessary to make sure we keep the docs in this project up to standard. Plus, you're not on your own — half these steps can be completed by official IPFS docs staff!

## Finding an issue

The IPFS project is hosted in GitHub. There's a bunch of reasons for this, one of them being that GitHub comes with an issue tracker, which enables the core IPFS team to field problems from the community. All community issues can read the docs, find issues, and raise issues in the docs repository (called a _repo_ for short).

All issues involving the IPFS docs themselves can be found in the [`ipfs/ipfs-docs` repo](https://github.com/ipfs/ipfs-docs/) under the [**Issues** tab](https://github.com/ipfs/ipfs-docs/issues/). Here you can see all the issues that are currently open. We try to tag each issue with relevant descriptive tags. Tags like _difficulty_ and _size_ can give a sense of the amount of effort a task will take to complete.

Let's jump into finding an issue.

1. Go to the IPFS repository at [github.com/ipfs/ipfs-docs](https://github.com/ipfs/ipfs-docs).
2. Select the **Issues** tab.
3. Click the **Label** dropdown and select the **help wanted** tag.
4. Select an issue that interests you.

Make a note of the issue number and keep it handy for later.

## Discussing the issue

As you can probably tell from the available tags, there are lots of different types of issues. Some are tiny one-sentence changes, and others are sizable projects that require a rewrite of several pages. For small issues, there may be very little or no discussion. There's no need to waste everybody's time talking about changing a broken link. But more significant issues will likely need input from different members of the project.

When adding to a discussion, remember that it may take days or weeks to conclude an issue. With this in mind, try to include all the relevant information anyone might need within each message.

Let's add to the discussion of the issue you've chosen:

1. Read through all the previous posts to get up to speed on the issue.
2. Add any comments you feel are necessary.
3. If you still want to tackle this issue, post a message saying that you'd like to take ownership of it.

Once you've claimed ownership of an issue, a member of the core IPFS team will assign you to it. If this is a large issue, someone from the IPFS team will check in with you from time to time and make sure you've got everything you need to progress with the issue.

## Creating a fix

If you've got this far, then you should have an issue in hand and a basic idea of how to fix it. Next up is implementing your fix! The process goes something like this:

1. Create a _fork_.
2. Make changes locally on your machine.
3. Push your changes.

If you're not familiar with Git and GitHub, then the phrase _fork_ might not mean much to you. Essentially, a _fork_ of a project is your own personal copy of that project. You can make as many changes to this copy whenever you want because you own it. The idea is that you can modify this personal copy and send your changes to the project team, who can then review all the work you've done.

The process for creating a fork of an existing piece of IPFS documentation is incredibly simple:

1. Go to the `ipfs/ipfs-docs` repository in [GitHub](https://github.com/ipfs/ipfs-docs).
2. Select **Fork** to create a copy of the project.
3. Clone your copy of the project down to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ipfs-docs.git
   ```

4. Make your changes locally.
5. Once all your changes are complete, make sure to push everything back to GitHub:

   ```bash
   git add .
   git commit -m "Fixed a broken URL, issue #123."
   git push
   ```

When adding a commit comment that actively fixes an issue within the project, try to summarize the fix in a few words and quote the issue number. Following this convention makes it easier for other people to quickly see what you've done.

## Create a pull request

Once you're done making commits and are ready to get a core team member's review of your work, it's time to create a pull request.

1. Go to the `ipfs/ipfs-docs` repository on [GitHub](https://github.com/ipfs/ipfs-docs).
2. Select the **Pull requests** tab.
3. Click **New pull request**.
4. Click **compare across forks** and select your repository from the **head repository** dropdown.
5. Leave a comment to expand upon your changes.
6. Click **Create pull request**.

GitHub will check if your changes create any merge conflicts with the branch you are trying to merge into.

## Waiting for a review

Before your changes can be merged into the project, they have to pass a review. Some other IPFS repositories, like `ipfs/ipfs-js` and `ipfs/ipfs-go`, have automatic tests that run against a pull request. These tests must pass _before_ the changes can be merged into the project.

The `ipfs/ipfs-docs` project doesn't currently have any automatic tests, so all pull requests from the community must be reviewed by at least one project member before they are merged in. Depending on the size of the pull request, this could take anywhere from a few minutes to a few days to review everything. Depending on the complexity of the pull request, there may be further discussion regarding your changes. Keep returning to GitHub and checking your [notifications page](https://github.com/notifications) to make sure you don't miss anything.

## Merge your fix

Once your pull request has been approved, it's ready to be merged into the project! Only project members with the correct rights can merge changes into the project, but you'll be notified as soon as the merge is complete.

## Finishing up

So there you have it! You've successfully completed your first contribution to the IPFS documentation. We're always on the lookout for great writers and educators to help us improve the IPFS docs and make the internet better for everyone, so keep up the good work!
