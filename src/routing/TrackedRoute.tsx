import React, { useEffect } from "react";
import ReactGA from "react-ga4";
import { Route } from "react-router-dom";

const TrackedRoute = (props: any) => {
  useEffect(() => {
    const page = props.location.pathname + window.location.search;
    if (process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID) {
      ReactGA.send({ hitType: "pageview", page: page });
    }
  }, [props.location.pathname]);

  return <Route {...props} />;
};

export default TrackedRoute;
