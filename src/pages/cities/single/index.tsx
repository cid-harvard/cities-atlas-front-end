import React, {useEffect} from 'react';
import EconomicComposition from './EconomicComposition';
import OutsideSubsidaries from './OutsideSubsidaries';
import GoodAt from './GoodAt';
import CompareSelf from './CompareSelf';
import IndustryMove from './IndustryMove';
import Summary from './Summary';
import {
  Route,
  Switch,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {CityRoutes, cityIdParam} from '../../../routing/routes';
import {createRoute} from '../../../routing/Utils';
import InnerPage from '../../../components/templates/InnerPage';

const City = () => {
  const history = useHistory();

  useEffect(() => {
    const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityBase);
    if (match && match.isExact && match.params[cityIdParam]) {
      history.replace(createRoute.city(CityRoutes.CityEconomicComposition, match.params[cityIdParam]));
    }
  }, [history]);

  return (
    <InnerPage>
      <Switch>
        <Route exact path={CityRoutes.CityEconomicComposition} component={EconomicComposition} />
        <Route exact path={CityRoutes.CityOutsideSubsidaries} component={OutsideSubsidaries} />
        <Route exact path={CityRoutes.CityGoodAt} component={GoodAt} />
        <Route exact path={CityRoutes.CityCompareSelf} component={CompareSelf} />
        <Route exact path={CityRoutes.CityIndustryMove} component={IndustryMove} />
        <Route exact path={CityRoutes.CitySummary} component={Summary} />
      </Switch>
    </InnerPage>
  );
};

export default City;
