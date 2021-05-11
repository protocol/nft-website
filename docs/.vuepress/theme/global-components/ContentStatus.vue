<template>
  <main class="content-status">
    <div>
      <div class="illustration">
        <img src="../assets/under-construction.svg" />
      </div>

      <h2>{{ title }}</h2>
      <div v-if="issueUrl" class="content-status-status">
        <p>
          <a target="_blank" :href="issueUrl">Check the status</a> of this page on GitHub to see how it's coming along. Are you a technical writer who'd like to make the global NFT community better for everyone? <a target="_blank" :href="issueUrl">Help write this page!</a>
        </p>
      </div>
      <div class="section content-status-vote">
        <Feedback
          titleTxt="Is this topic important to you?"
          evtYes="topic_important"
          evtNo="topic_not_important"
          noTxt="Not really"
          yesTxt="Yes"
          :editOrIssueLinks="false"
        />
      </div>
    </div>

    <div class="content-status-info" style="clear: both">
      <div v-if="related" class="section content-other-resources">
        <h3>Other resources to try</h3>
        <ul>
          <li v-for="(item, title) in related">
            <a :href="item" :alt="title" target="_blank">{{ title }}</a>
          </li>
        </ul>
      </div>
    </div>
    <style>
      footer.page-edit {
        display: none;
      }
    </style>
  </main>
</template>

<script>
import Feedback from '../components/Feedback.vue'

export default {
  computed: {
    issueUrl: function () {
      return this.$frontmatter && this.$frontmatter.issueUrl
    },
    repo: function () {
      return (
        this.$site && this.$site.themeConfig && this.$site.themeConfig.docsRepo
      )
    },
    related: function () {
      return this.$frontmatter.related
    }
  },
  props: {
    title: {
      type: String,
      default: 'This content is coming soon!'
    }
  },
  components: { Feedback }
}
</script>

<style lang="stylus" scoped>
h2, h3 {
  border-bottom: none;
  margin: 0.5rem 0; // TODO: make global
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin: 0;
    padding: 0;
  }
}

.content-status-vote {
  margin-top: 3rem;
}

.illustration {
  width: 20%;
  float: right;
  margin-left: 2em;
}

// TODO: make global
.section {
  margin-bottom: 3rem;
}

@media (min-width: $MQNarrow) {
  .illustration {
    width: 25%;
    float: right;
    margin-left: 3em;
  }
}
</style>
