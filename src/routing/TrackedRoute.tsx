import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

const TrackedRoute = (props: any) => {
  useEffect(() => {
    const page = props.location.pathname;
    ReactGA.set({page});
    ReactGA.pageview(page);
  }, [props.location.pathname]);

  return (
    <Route {...props}/>
  );
};

export default TrackedRoute;
