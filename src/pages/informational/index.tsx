import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import {InformationalRoutes} from '../../routing/routes';
import InformationalPage from '../../components/templates/InformationalPage';
import Data from './data';
import About from './about';
import Contact from './contact';

const City = () => {

  return (
    <InformationalPage>
      <Switch>
        <Route path={InformationalRoutes.Data} component={Data} />
        <Route path={InformationalRoutes.About} component={About} />
        <Route path={InformationalRoutes.Contact} component={Contact} />
      </Switch>
    </InformationalPage>
  );
};

export default City;
