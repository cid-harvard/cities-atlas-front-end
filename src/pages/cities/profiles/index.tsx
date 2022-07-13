import React, {useEffect, useState} from 'react';
import EconomicComposition from './economicComposition';
import Overview from './overview';
import GoodAt from './goodAt';
import IndustrySpacePosition from './industrySpacePosition';
import GrowthOpportunities from './growthOpportunities';
import {
  Switch,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {CityRoutes, cityIdParam, GlobalQueryParams} from '../../../routing/routes';
import {createRoute} from '../../../routing/Utils';
import InnerPage from '../../../components/templates/InnerPage';
import useFluent from '../../../hooks/useFluent';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import TrackedRoute from '../../../routing/TrackedRoute';
import { usePrevious } from 'react-use';
import styled from 'styled-components';
import { backgroundDark, primaryFont } from '../../../styling/styleUtils';

const Button = styled.button`
  border: solid 1px #fff;
  background-color: transparent;
  color: #fff;
  font-family: ${primaryFont};
  font-size: 0.875rem;
  margin-top: 0.75rem;

  &:hover {
    background-color: #fff;
    color: ${backgroundDark};
  }
`;

const overviewTooltipLocalStorageKey = 'cityProfileOverviewOneTimeTooltipLocalStorageKeyv1';
enum StringBoolean {
  'TRUE' = 'TRUE',
  'FALSE' = 'FALSE',
}

const City = () => {
  const getString = useFluent();
  const getStringWithNewLines = (value: string) => getString(value).replace(/\\n/g, '\n');
  const history = useHistory();
  const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityBase);
  const matchOverview = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityOverview);
  const cityId = useCurrentCityId();
  const prevCityId = usePrevious(cityId);

  const [showOverviewTooltip, setShowOverviewTooltip] = useState<boolean>(false);
  const dismissOverviewTooltip = () => {
    setShowOverviewTooltip(false);
    localStorage.setItem(overviewTooltipLocalStorageKey, StringBoolean.TRUE);
  };

  useEffect(() => {
    const dismissed = localStorage.getItem(overviewTooltipLocalStorageKey);
    if (cityId && prevCityId && cityId !== prevCityId && !matchOverview?.isExact && dismissed !== StringBoolean.TRUE) {
      setShowOverviewTooltip(true);
    }
  }, [matchOverview, cityId, prevCityId]);

  useEffect(() => {
    if (showOverviewTooltip && matchOverview?.isExact) {
      setShowOverviewTooltip(false);
      localStorage.setItem(overviewTooltipLocalStorageKey, StringBoolean.TRUE);
    }
  }, [matchOverview, showOverviewTooltip]);

  useEffect(() => {
    // If route is blank, default to first slide
    if (match && match.isExact && match.params[cityIdParam]) {
      history.replace(createRoute.city(CityRoutes.CityOverview, match.params[cityIdParam]));
    }

  }, [history, match]);

  const baseLinkData = cityId !== null ? [
    {
      label: getStringWithNewLines('cities-single-page-titles-question-1'),
      url: createRoute.city(CityRoutes.CityOverview, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
        'rca_threshold' as keyof GlobalQueryParams,
      ],
      tooltipText: showOverviewTooltip ? (
          <>
          {getString('city-overview-one-time-tooltip')}<br />
          <Button onClick={dismissOverviewTooltip}>{getString('city-overview-one-time-tooltip-got-it')}</Button>
          </>
        ) : undefined,
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-2'),
      url: createRoute.city(CityRoutes.CityEconomicComposition, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
        'rca_threshold' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-3'),
      url: createRoute.city(CityRoutes.CityGoodAt, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'node_sizing' as keyof GlobalQueryParams,
        'cluster_level' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
        'rca_threshold' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-4'),
      url: createRoute.city(CityRoutes.CityIndustrySpacePosition, cityId),
      removeParams: [
        'digit_level' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
      ],
    },
    {
      label: getStringWithNewLines('cities-single-page-titles-question-5'),
      url: createRoute.city(CityRoutes.CityGrowthOpportunities, cityId),
      removeParams: [
        'cluster_overlay' as keyof GlobalQueryParams,
        'city_node_sizing' as keyof GlobalQueryParams,
        'city_color_by' as keyof GlobalQueryParams,
        'rca_threshold' as keyof GlobalQueryParams,
      ],
    },
  ] : [];

  return (
    <InnerPage
      baseLinkData={baseLinkData}
    >
      <Switch>
        <TrackedRoute path={CityRoutes.CityOverview} component={Overview} />
        <TrackedRoute path={CityRoutes.CityEconomicComposition} component={EconomicComposition} />
        <TrackedRoute path={CityRoutes.CityGoodAt} component={GoodAt} />
        <TrackedRoute path={CityRoutes.CityIndustrySpacePosition} component={IndustrySpacePosition} />
        <TrackedRoute path={CityRoutes.CityGrowthOpportunities} component={GrowthOpportunities} />
      </Switch>
    </InnerPage>
  );
};

export default City;
