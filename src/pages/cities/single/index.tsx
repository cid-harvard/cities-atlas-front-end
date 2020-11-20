import React, {useEffect} from 'react';
import EconomicComposition from './economicComposition';
import OutsideSubsidaries from './outsideSubsidaries';
import GoodAt from './goodAt';
import CompareSelf from './compareSelf';
import IndustryMove from './industryMove';
import Summary from './summary';
import {
  Route,
  Switch,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {CityRoutes, cityIdParam} from '../../../routing/routes';
import {createRoute} from '../../../routing/Utils';
import InnerPage from '../../../components/templates/InnerPage';
import useFluent from '../../../hooks/useFluent';
import useCurrentCityId from '../../../hooks/useCurrentCityId';

const City = () => {
  const getString = useFluent();
  const getStringWithNewLines = (value: string) => getString(value).replace(/\\n/g, '\n');
  const history = useHistory();
  const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityBase);
  const cityId = useCurrentCityId();

  useEffect(() => {
    // If route is blank, default to first slide
    if (match && match.isExact && match.params[cityIdParam]) {
      history.replace(createRoute.city(CityRoutes.CityEconomicComposition, match.params[cityIdParam]));
    }
  }, [history, match]);

  const baseLinkData = cityId !== null ? [
    {
      label: getStringWithNewLines('cities-single-page-titles-question-1'),
      url: createRoute.city(CityRoutes.CityEconomicComposition, cityId),
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-2'),
      url: createRoute.city(CityRoutes.CityIndustryMove, cityId),
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-3'),
      url: createRoute.city(CityRoutes.CityGoodAt, cityId),
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-4'),
      url: createRoute.city(CityRoutes.CityCompareSelf, cityId),
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-5'),
      url: createRoute.city(CityRoutes.CityOutsideSubsidaries, cityId),
      beta: true,
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-6'),
      url: createRoute.city(CityRoutes.CitySummary, cityId),
      beta: true,
    },
  ] : [];

  return (
    <InnerPage
      baseLinkData={baseLinkData}
    >
      <Switch>
        <Route path={CityRoutes.CityEconomicComposition} component={EconomicComposition} />
        <Route path={CityRoutes.CityOutsideSubsidaries} component={OutsideSubsidaries} />
        <Route path={CityRoutes.CityGoodAt} component={GoodAt} />
        <Route path={CityRoutes.CityCompareSelf} component={CompareSelf} />
        <Route path={CityRoutes.CityIndustryMove} component={IndustryMove} />
        <Route path={CityRoutes.CitySummary} component={Summary} />
      </Switch>
    </InnerPage>
  );
};

export default City;
