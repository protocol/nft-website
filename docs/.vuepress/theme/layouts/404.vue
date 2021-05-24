<template>
  <div class="theme-container page-nosidebar">
    <Navbar />
    <div class="theme-default-content">
      <h1>😯 404</h1>
      <h3>Oops! This page has moved or no longer exists</h3>

      <p>
        We've logged this issue and invite you to choose your next adventure
        below.
      </p>
      <p>
        <RouterLink to="/">
          Return home
        </RouterLink>
        or <a href="#" @click="searchFocus">try a search</a>
      </p>
    </div>
  </div>
</template>

<script>
import countly from '@theme/utils/countly'
import Navbar from '@theme/components/Navbar.vue'

export default {
  name: 'NotFound',
  components: {
    Navbar
  },

  created() {
    if (typeof this.$ssrContext !== 'undefined') {
      this.$ssrContext.userHeadTags += `<base href="/" />`
    }
  },

  mounted() {
    countly.trackEvent(countly.events.NOT_FOUND, {
      path: this.$route.path,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
    })
  },
  methods: {
    searchFocus(e) {
      e.preventDefault()
      document.querySelector('#search-form input').focus()
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-nosidebar {
	background-color: $offWhiteColor;
}
</style>
