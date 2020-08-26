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
import {Routes} from './routing/routes';
import './styling/fonts/fonts.css';

function App() {
  return (
    <>
      <Helmet>
        {/* Set default meta data values */}
        <title>{defaultMetaTitle}</title>
        <meta property='og:title' content={defaultMetaTitle} />
      </Helmet>
      <GlobalStyles />
      <Router>
        <Switch>
          <Route exact path={Routes.Landing} component={Landing} />
          <Route component={Landing} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
