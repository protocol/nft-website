const path = require('path')

module.exports = (params = {}) => ({
  name: 'vuepress-plugin-speedcurve',
  define() {
    const id = params.id

    return { SPEEDCURVE_ID: id || false }
  },
  enhanceAppFiles: path.resolve(__dirname, 'enhanceAppFiles.js')
})
