<template>
  <div class="local-page-edit">
    <div class="local-edit-link" v-if="editLink">
      <a :href="editLink" target="_blank" rel="noopener noreferrer">{{
        editLinkText
      }}</a>
      <span v-if="$site.themeConfig.feedbackWidget.docsRepoIssue">
        on GitHub or
        <a :href="openIssueLink" target="_blank" rel="noopener noreferrer"
          >open an issue</a
        > 
        for it
      </span>
    </div>
  </div>
</template>
<script>
export const endingSlashRE = /\/$/
export const outboundRE = /^[a-z]+:/i

export default {
  name: 'EditOrIssue',
  computed: {
    lastUpdated() {
      return this.$page.lastUpdated
    },

    lastUpdatedText() {
      if (typeof this.$themeLocaleConfig.lastUpdated === 'string') {
        return this.$themeLocaleConfig.lastUpdated
      }
      if (typeof this.$site.themeConfig.lastUpdated === 'string') {
        return this.$site.themeConfig.lastUpdated
      }
      return 'Last Updated'
    },

    openIssueLink() {
      const { docsRepoIssue } = this.$site.themeConfig.feedbackWidget
      return `https://github.com/${docsRepoIssue}/issues/new?assignees=&labels=need%2Ftriage&template=open-an-issue.md&title=%5BPAGE+ISSUE%5D+${this.$page.title}`
    },

    editLink() {
      const {
        repo,
        docsDir = '',
        docsBranch = 'main',
        docsRepo = repo
      } = this.$site.themeConfig

      if (docsRepo && this.$page.relativePath) {
        return this.createEditLink(
          repo,
          docsRepo,
          docsDir,
          docsBranch,
          this.$page.relativePath
        )
      }
      return null
    },

    editLinkText() {
      return (
        this.$themeLocaleConfig.editLinkText ||
        this.$site.themeConfig.editLinkText ||
        `Edit this page`
      )
    }
  },

  methods: {
    createEditLink(repo, docsRepo, docsDir, docsBranch, path) {
      const bitbucket = /bitbucket.org/
      if (bitbucket.test(repo)) {
        const base = outboundRE.test(docsRepo) ? docsRepo : repo
        return (
          base.replace(endingSlashRE, '') +
          `/src` +
          `/${docsBranch}/` +
          (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '') +
          path +
          `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
        )
      }

      const base = outboundRE.test(docsRepo)
        ? docsRepo
        : `https://github.com/${docsRepo}`
      return (
        base.replace(endingSlashRE, '') +
        `/edit` +
        `/${docsBranch}/` +
        (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '') +
        path
      )
    }
  }
}
</script>
