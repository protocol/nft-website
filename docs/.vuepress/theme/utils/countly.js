import debug from './debug'

export const events = {
  FEEDBACK_HELPFUL: 'feedbackHelpful',
  FEEDBACK_IMPORTANT: 'feedbackImportant',
  FEEDBACK_GENERAL: 'feedbackGeneral',
  NOT_FOUND: 'notFound',
}

/*
  Track an event to countly with the provided data
*/
export function trackEvent (event, data = {}) {
  debug && console.info('[countly]', 'trackEvent()', event, data)

  if (typeof window === 'undefined') {
    return
  }

  window.Countly.q.push(['add_event', {
    key: event,
    segmentation: data
  }])
}


export default {
  events,
  trackEvent
}
