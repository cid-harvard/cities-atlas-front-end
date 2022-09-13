import ReactGA from 'react-ga4';

const googleAnalyticsEvent = (category: string, action: string, label: string) => {
  if (process.env.NODE_ENV === 'production') {
    // See: https://developers.google.com/analytics/devguides/collection/gtagjs/events
    // See: https://www.npmjs.com/package/react-ga4
    // ReactGA.send({hitType: "event", category: category, label: label, action: action});
    ReactGA.event({category: category, label: label, action: action});

  }
};

export default googleAnalyticsEvent;
