import React from 'react';
import GlobalStyles from './styling/GlobalStyles';
import {defaultMetaTitle} from './metadata';
import Helmet from 'react-helmet';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import Landing from './pages/landing';
import City from './pages/cities/single';
import {Routes} from './routing/routes';
import './styling/fonts/fonts.css';
import AppContext, {useWindowWidth} from './contextProviders/appContext';

function App() {
  const windowDimensions = useWindowWidth();
  return (
    <>
      <Helmet>
        {/* Set default meta data values */}
        <title>{defaultMetaTitle}</title>
        <meta property='og:title' content={defaultMetaTitle} />
      </Helmet>
      <GlobalStyles />
      <AppContext.Provider value={{windowDimensions}}>
        <Router>
          <Switch>
            <Route exact path={Routes.Landing} component={Landing} />
            <Route path={Routes.CityBase} component={City} />
            <Route component={Landing} />
          </Switch>
        </Router>
      </AppContext.Provider>
    </>
  );
}

export default App;
