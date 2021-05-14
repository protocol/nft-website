'use strict'

/* global COUNTLY_KEY */

module.exports = () => {
  if (
    DOMAIN && COUNTLY_KEY &&
    typeof window !== 'undefined'
  ) {
    ;(function () {
      // prepend countly to the domain
      const domain = DOMAIN.startsWith('http') ?
        `${DOMAIN.split('//')[0]}//countly.${DOMAIN.split('//')[1]}` :
        `https://countly.${DOMAIN}`

      const countlyScript = document.createElement('script')
      countlyScript.innerHTML = `
          var Countly = Countly || {};
          Countly.q = Countly.q || [];
          //provide countly initialization parameters
          Countly.app_key = '${COUNTLY_KEY}';
          Countly.url = '${domain}';
          Countly.q.push(['track_sessions']);
          Countly.q.push(['track_pageview']);
          Countly.q.push(['track_clicks']);
          Countly.q.push(['track_scrolls']);
          Countly.q.push(['track_links']);
          (function() {
            var cly = document.createElement('script'); cly.type = 'text/javascript';
            cly.async = true;
            //enter url of script here
            cly.src = '${domain}/sdk/web/countly.min.js';
            cly.onload = function(){Countly.init()};
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
          })();`

      document.body.appendChild(countlyScript)
    })()
  }
}
