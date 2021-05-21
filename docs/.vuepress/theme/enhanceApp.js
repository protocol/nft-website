export default ({ router, isServer }) => {
  if (!isServer) {
    // track page view via Countly when route changes
    router.afterEach((to) => {
      if (!window.Countly) return
      window.Countly.q.push(['track_pageview', to.path])
    })
  }
}
