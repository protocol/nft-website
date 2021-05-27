<template>
  <div class="feedback">
    <h3>{{ titleTxt }}</h3>
    <div v-if="!voteSubmitted" class="feedback-actions">
      <button
        class="btn btn-primary"
        :title="yesTxt"
        v-on:click="sendFeedback(evtYes)"
      >
        {{ yesTxt }}
      </button>
      <button
        class="btn btn-primary"
        :title="noTxt"
        v-on:click="sendFeedback(evtNo)"
      >
        {{ noTxt }}
      </button>
    </div>
    <div v-if="voteSubmitted" class="feedback-result">
      <p>{{ thanksTxt }}</p>
    </div>
    <div v-if="editOrIssueLinks">
      <p>
        <b>Help us improve this site!</b>
      </p>
      <div>
        <EditOrIssue />
      </div>
      <div>
        <a
          href="https://github.com/protocol/nft-website/issues/new?assignees=&labels=need%2Ftriage&template=content-or-feature-suggestion.md&title=%5BCONTENT+REQUEST%5D+%28add+your+title+here%21%29"
          target="_blank"
          rel="noopener noreferrer"
        >
          Suggest new content
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import countly from '@theme/utils/countly'
import EditOrIssue from './EditOrIssue.vue'

export default {
  data: function () {
    return {
      voteSubmitted: false,
      currentPath: this.$route.path
    }
  },
  methods: {
    sendFeedback: function (answer) {
      this.voteSubmitted = true

      let event
      
      switch (this.evtYes) {
        case 'information_helpful':
          event = countly.events.FEEDBACK_HELPFUL
          break;
        case 'topic_important':
          event = countly.events.FEEDBACK_IMPORTANT
          break;
        default:
          event = countly.events.FEEDBACK_GENERAL
      }

      countly.trackEvent(event, {
        path: this.$route.path,
        question: this.titleTxt,
        answer,
        answerText: !answer.includes('not') ? this.yesTxt : this.noTxt,
      })
    }
  },
  watch: {
    '$route.path': function (path) {
      this.voteSubmitted = false
      this.currentPath = path
    }
  },
  props: {
    titleTxt: {
      type: String,
      default: 'Was this information helpful?'
    },
    thanksTxt: {
      type: String,
      default: 'Thanks! We will use your feedback to prioritize future work.'
    },
    evtYes: {
      type: String,
      default: 'yes'
    },
    evtNo: {
      type: String,
      default: 'no'
    },
    yesTxt: {
      type: String,
      default: 'Yes'
    },
    noTxt: {
      type: String,
      default: 'No'
    },
    editOrIssueLinks: {
      type: Boolean,
      default: true
    }
  },
  components: {
    EditOrIssue
  }
}
</script>

<style lang="stylus" scoped>
@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.feedback {
  background-color: $feedbackBgColor;
  padding: 0 1.5rem 2rem 1.5rem;
  border: 2px solid #fff;
  box-shadow:  -2px -2px 0 1px $tertiaryColor,
    2px 2px 0 1px $secondaryColor;

  h3 {
    margin-bottom: 1rem;
  }
  &-result {
    animation: fadein 0.5s;
    min-height: 38px;
    display: flex;
    align-items: center;

    * {
      margin: 0;
    }
  }
}

.feedback-actions {
  display: flex;
  justify-content: center;

  button {
    flex: 1;
  }
}

.local-page-edit {
  margin-bottom: 1rem;
}

@media (min-width: $MQMobile) {

  .feedback-actions {
    display: block;
  }
}


section {
  margin: 1rem 0;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin: 0;
      line-height: 2em;
      padding: 0;
    }
  }
}

@media (min-width: $MQNarrow) {
  section {
    display: flex;

    .block {
      flex: 1;
    }
  }
}
</style>
