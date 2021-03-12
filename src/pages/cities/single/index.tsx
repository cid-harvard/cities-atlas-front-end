import React, {useEffect} from 'react';
import EconomicComposition from './economicComposition';
import SimilarCities from './similarCities';
import GoodAt from './goodAt';
import IndustrySpacePosition from './industrySpacePosition';
import GrowthOpportunities from './growthOpportunities';
import {
  Route,
  Switch,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {CityRoutes, cityIdParam, GlobalQueryParams} from '../../../routing/routes';
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
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-2'),
      url: createRoute.city(CityRoutes.CityGoodAt, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'cluster_level' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-3'),
      url: createRoute.city(CityRoutes.CitySimilarCities, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'digit_level' as keyof GlobalQueryParams,
        'cluster_level' as keyof GlobalQueryParams,
        'color_by' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-4'),
      url: createRoute.city(CityRoutes.CityIndustrySpacePosition, cityId),
      removeParams: [
        'digit_level' as keyof GlobalQueryParams,
        'composition_type' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-5'),
      url: createRoute.city(CityRoutes.CityGrowthOpportunities, cityId),
      removeParams: [
        'digit_level' as keyof GlobalQueryParams,
        'cluster_overlay' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
      ],
    },
  ] : [];

  return (
    <InnerPage
      baseLinkData={baseLinkData}
    >
      <Switch>
        <Route path={CityRoutes.CityEconomicComposition} component={EconomicComposition} />
        <Route path={CityRoutes.CitySimilarCities} component={SimilarCities} />
        <Route path={CityRoutes.CityGoodAt} component={GoodAt} />
        <Route path={CityRoutes.CityIndustrySpacePosition} component={IndustrySpacePosition} />
        <Route path={CityRoutes.CityGrowthOpportunities} component={GrowthOpportunities} />
      </Switch>
    </InnerPage>
  );
};

export default City;
