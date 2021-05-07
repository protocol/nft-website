<template>
  <div class="theme-container">
    <Navbar />
    <div class="theme-default-content">
      <h1>😯 404</h1>
      <h3>Oops, this page has moved or no longer exists</h3>

      <p>
        We've logged this issue and invite you to choose your next adventure
        below.
      </p>
      <p>
        <RouterLink to="/">
          Return home
        </RouterLink>
        or <a href="#" @click="searchFocus">try our superb search</a>
      </p>
    </div>
  </div>
</template>

<script>
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
    // bail if ga is not enabled
    if (!window.ga) return

    window.ga('send', 'event', {
      eventCategory: '404',
      eventAction: this.$route.path,
      eventLabel: document.referrer
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
