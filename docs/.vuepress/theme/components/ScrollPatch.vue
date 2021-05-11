<template></template>
<script>
export default {
  methods: {
    scrollTop: function () {
      // FireFox has a problem setting the correct scroll postion on route change this patch will fix it for now
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        window.scrollTo(0, 0)
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 100)
      }
    }
  },
  watch: {
    '$route.path': function (path) {
      this.scrollTop()
    }
  }
}
</script>
