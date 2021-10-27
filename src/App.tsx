import React from 'react';
import GlobalStyles from './styling/GlobalStyles';
import Helmet from 'react-helmet';
import {
  Route,
  Switch,
} from 'react-router-dom';
import Landing from './pages/landing';
import City from './pages/cities/profiles';
import SimilarCities from './pages/cities/similarity';
import Informational from './pages/informational';
import {Routes} from './routing/routes';
import './styling/fonts/fonts.css';
import AppContext, {useWindowWidth} from './contextProviders/appContext';
import {OverlayPortal} from './components/standardModal';
import useFluent from './hooks/useFluent';
import ReactGA from 'react-ga';
import TrackedRoute from './routing/TrackedRoute';
import SurveyWidget from './components/analytics/SurveyWidget';

ReactGA.initialize('UA-41291966-12', {debug: false});

function App() {
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  const defaultMetaTitle = getString('meta-data-title-default');
  return (
    <>
      <Helmet>
        {/* Set default meta data values */}
        <title>{defaultMetaTitle}</title>
        <meta property='og:title' content={defaultMetaTitle} />
      </Helmet>
      <GlobalStyles />
      <AppContext.Provider value={{windowDimensions}}>
        <Switch>
          <TrackedRoute exact path={Routes.Landing} component={Landing} />
          <Route path={Routes.CityBase} component={City} />
          <Route path={Routes.CitySimilarCities} component={SimilarCities} />
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
