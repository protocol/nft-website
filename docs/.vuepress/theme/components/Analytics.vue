<template></template>

<script>
export default {
  data: function () {
    return {
      searchBox: false,
      queryVal: null
    }
  },
  mounted: function () {
    // track outbound clicks
    document.addEventListener('click', this.trackOutbound)

    const searchBox = document.querySelector('.navbar .links input')
    if (searchBox) {
      searchBox.addEventListener('keyup', this.captureSearch)
      // default algolia search does not clear the input query val
      // this patch ensures it is reset upon losing focus
      searchBox.addEventListener('focusout', evt => (evt.target.value = ''))
      this.searchBox = searchBox
    }
  },
  beforeDestroy() {
    // remove on unmount
    document.removeEventListener('click', this.trackOutbound)

    if (this.searchBox) {
      this.searchBox.removeEventListener('keyup', this.captureSearch)
    }
  },
  watch: {
    '$route.path': function (path) {
      if (this.queryVal) {
        this.trackQuery(path)
      }
    },
    $route: function () {
      if (this.searchBox) {
        // remove focus from the searchBox upon router action
        this.searchBox.blur()
      }
    }
  },
  methods: {
    captureSearch(q) {
      this.queryVal = this.searchBox.value
    },
    trackQuery(path) {
      if (!window.ga) return
      // encode search query to suitable ga format
      let encodedQuery = encodeURIComponent(this.queryVal).replace(/%20/g, '+')
      // send fake page query to track searches
      ga('send', 'pageview', `/search/?q=${encodedQuery}`)
      this.queryVal = null
    },
    trackOutbound(e) {
      if (!window.ga) return
      let link = e.target.closest('a')
      if (link === null || window.location.host === link.host) return
      ga('send', 'event', 'outbound', 'click', link.href)
    }
  }
}
</script>
