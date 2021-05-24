const path = require('path')

module.exports = (params = {}) => ({
  name: 'vuepress-plugin-countly',
  define() {
    return {
      DOMAIN: params.domain || '',
      COUNTLY_KEY: params.key || false
    }
  },
  enhanceAppFiles: path.resolve(__dirname, 'enhanceAppFiles.js')
})
