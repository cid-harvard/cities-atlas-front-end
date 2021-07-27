const googleAnalyticsEvent = (action: string, label: string) => {
  if (process.env.NODE_ENV === 'production') {
    (window as any).ga('send', {
      hitType: 'event',
      eventCategory: 'User Engagement',
      eventLabel: label,
      eventAction: action,
    });
  }
};

export default googleAnalyticsEvent;
