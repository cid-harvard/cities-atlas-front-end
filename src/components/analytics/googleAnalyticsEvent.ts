const googleAnalyticsEvent = (category: string, action: string, label: string) => {
  if (process.env.NODE_ENV === 'production') {
    (window as any).ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventLabel: label,
      eventAction: action,
    });
  }
};

export default googleAnalyticsEvent;
