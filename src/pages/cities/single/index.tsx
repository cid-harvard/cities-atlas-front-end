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
  const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityBase);
  const cityId = match && match.params[cityIdParam] ? match.params[cityIdParam] : null;

  useEffect(() => {
    if (match && match.isExact && match.params[cityIdParam]) {
      history.replace(createRoute.city(CityRoutes.CityEconomicComposition, match.params[cityIdParam]));
    }
  }, [history, match]);

  const baseLinkData = cityId !== null ? [
    {
      label: "What is my city's\neconomic position?",
      url: createRoute.city(CityRoutes.CityEconomicComposition, cityId),
    },
    {
      label: 'What cities own/host\nsubsidaries in and from\nmy city?',
      url: createRoute.city(CityRoutes.CityOutsideSubsidaries, cityId),
    },
    {
      label: 'What is my city\ngood at?',
      url: createRoute.city(CityRoutes.CityGoodAt, cityId),
    },
    {
      label: 'What cities should I\ncompare myself to?',
      url: createRoute.city(CityRoutes.CityCompareSelf, cityId),
    },
    {
      label: 'What industry can\nmy city move to?',
      url: createRoute.city(CityRoutes.CityIndustryMove, cityId),
    },
    {
      label: 'Quick facts &\nsummary',
      url: createRoute.city(CityRoutes.CitySummary, cityId),
    },
  ] : [];

  return (
    <InnerPage
      baseLinkData={baseLinkData}
    >
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
