import React, { useState } from 'react';
import TopIndustryComparisonBarChart from
  '../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart';
import IndustryZoomableBarChart from
  '../../../../../components/dataViz/zoomableComparisonBarChart/IndustryZoomableBarChart';
import { defaultYear } from '../../../../../Utils';
import {
  defaultCompositionType,
  CompositionType,
  defaultDigitLevel,
  isValidPeerGroup,
  PeerGroup,
} from '../../../../../types/graphQL/graphQLTypes';
import useQueryParams from '../../../../../hooks/useQueryParams';
import { RegionGroup } from '../../../../../components/dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import { createRoute } from '../../../../../routing/Utils';
import TrackedRoute from '../../../../../routing/TrackedRoute';
import { CityRoutes, cityIdParam } from '../../../../../routing/routes';
import {
  useHistory,
  Switch,
  matchPath,
} from 'react-router-dom';

interface Props {
  primaryCity: string;
  secondaryCity: string;
  hiddenSectors: string[];
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity, secondaryCity, hiddenSectors,
  } = props;

  const { digit_level, composition_type } = useQueryParams();
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const history = useHistory();
  const isIndustryComparison = matchPath<{ [cityIdParam]: string }>(
    history.location.pathname, CityRoutes.CityGoodAtAbsolutePresenceComparison,
  );
  const vizNavigation = [
    {
      label: 'Top 10 Share Differences',
      active: !!(!isIndustryComparison || !isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGoodAtAbsolutePresence, primaryCity)
          + history.location.search,
        );
      },
    },
    {
      label: 'Compare Industries',
      active: !!(isIndustryComparison && isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGoodAtAbsolutePresenceComparison, primaryCity)
          + history.location.search,
        );
      },
    },
  ];

  let comparison: number | RegionGroup | PeerGroup;
  if (secondaryCity === RegionGroup.World) {
    comparison = RegionGroup.World;
  } else if (isValidPeerGroup(secondaryCity)) {
    comparison = secondaryCity as PeerGroup;
  } else {
    comparison = parseInt(secondaryCity, 10);
  }

  return (
    <>
      <Switch>
        <TrackedRoute path={CityRoutes.CityGoodAtAbsolutePresenceComparison}
          render={() => (
            <IndustryZoomableBarChart
              primaryCity={parseInt(primaryCity, 10)}
              comparison={comparison}
              year={defaultYear}
              setHighlighted={setHighlighted}
              highlighted={highlighted ? parseInt(highlighted, 10) : null}
              compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
              hiddenSectors={hiddenSectors}
              vizNavigation={vizNavigation}
            />
          )}
        />
        <TrackedRoute path={CityRoutes.CityGoodAtAbsolutePresence}
          render={() => (
            <TopIndustryComparisonBarChart
              primaryCity={parseInt(primaryCity, 10)}
              comparison={comparison}
              year={defaultYear}
              setHighlighted={setHighlighted}
              highlighted={highlighted}
              digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
              compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
              hiddenSectors={hiddenSectors}
              vizNavigation={vizNavigation}
            />
          )}
        />
      </Switch>
    </>
  );
};

export default CompositionComparison;
