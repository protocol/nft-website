<template>
  <main class="page">
    <slot name="top" />

    <Content class="theme-default-content" />

    <div class="content-footer" v-if="!isContentStatus">
      <Feedback
        class="content-feedback"
        evtYes="information_helpful"
        evtNo="information_not_helpful"
      />
      <PageEdit />
      <PageNav v-bind="{ sidebarItems }" />
    </div>

    <Analytics />
    <ScrollPatch />

    <slot name="bottom" />
  </main>
</template>

<script>
import PageEdit from '@parent-theme/components/PageEdit.vue'
import PageNav from '@parent-theme/components/PageNav.vue'

import Feedback from './Feedback.vue'
import Analytics from './Analytics.vue'
import ScrollPatch from './ScrollPatch.vue'

export default {
  name: 'Page',
  components: {
    PageEdit,
    PageNav,
    Feedback,
    Analytics,
    ScrollPatch
  },
  props: ['sidebarItems'],
  computed: {
    isContentStatus: function () {
      return !!(this.$frontmatter && this.$frontmatter.issueUrl)
    }
  },
  methods: {
    smoothScroll: function () {
      var root = document.getElementsByTagName('html')[0]
      // only enable smooth-scrolling on pages shorter that 15000 px
      return root.scrollHeight < 15000
        ? root.classList.add('smooth-scroll')
        : root.classList.remove('smooth-scroll')
    }
  },
  mounted: function () {
    this.smoothScroll()
  },
  updated: function () {
    this.smoothScroll()
  }
}
</script>

<style lang="stylus" scoped>
.page {
  padding-bottom: 2rem;
  display: block;
}

.content-footer {
  padding-top: 0;
  max-width: $contentWidth;
}

.page-edit {
  max-width: 100%;
  padding: 2rem 2rem;
}

.content-feedback {
  padding: 1rem 2rem 2rem 2rem;
}

@media (min-width: $MQMobile) {
  .content-footer {
    padding: 0 2.5rem;
    padding-top: 0;
  }

  .page-edit {
    padding: 2.5rem 0;
  }

  section {
    display: flex;

    .block {
      flex: 1;
    }
  }
}
</style>
