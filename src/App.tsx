import React from "react";
import GlobalStyles from "./styling/GlobalStyles";
import Helmet from "react-helmet";
import { Route, Switch } from "react-router-dom";
import Landing from "./pages/landing";
import City from "./pages/cities/profiles";
import SimilarCities from "./pages/cities/similarity";
import Informational from "./pages/informational";
import { Routes } from "./routing/routes";
import "./styling/fonts/fonts.css";
import AppContext, { useWindowWidth } from "./contextProviders/appContext";
import { OverlayPortal } from "./components/standardModal";
import useFluent from "./hooks/useFluent";
import ReactGA from "react-ga4";
import TrackedRoute from "./routing/TrackedRoute";
import SurveyWidget from "./components/analytics/SurveyWidget";

if (process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID) {
  ReactGA.initialize([
    {
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID,
    },
  ]);
}

function App() {
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  const defaultMetaTitle = getString("meta-data-title-default");
  return (
    <>
      <Helmet>
        {/* Set default meta data values */}
        <title>{defaultMetaTitle}</title>
        <meta property="og:title" content={defaultMetaTitle} />
      </Helmet>
      <GlobalStyles />
      <AppContext.Provider value={{ windowDimensions }}>
        <Switch>
          <TrackedRoute exact path={Routes.Landing} component={Landing} />
          <Route path={Routes.CitySimilarCities} component={SimilarCities} />
          <Route path={Routes.CityBase} component={City} />
          <TrackedRoute path={Routes.AboutBase} component={Informational} />
          <TrackedRoute path={Routes.ContactBase} component={Informational} />
          <TrackedRoute path={Routes.FaqBase} component={Informational} />
          <TrackedRoute component={Landing} />
        </Switch>
        <OverlayPortal />
        <SurveyWidget />
      </AppContext.Provider>
    </>
  );
}

export default App;
