import React, { useState } from "react";
import TopIndustryComparisonBarChart from "../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart";
import IndustryZoomableBarChart from "../../../../../components/dataViz/zoomableComparisonBarChart/IndustryZoomableBarChart";
import { defaultYear } from "../../../../../Utils";
import {
  defaultCompositionType,
  CompositionType,
  defaultDigitLevel,
  isValidPeerGroup,
  PeerGroup,
  ClassificationNaicsCluster,
  ClusterLevel,
} from "../../../../../types/graphQL/graphQLTypes";
import useQueryParams from "../../../../../hooks/useQueryParams";
import { RegionGroup } from "../../../../../components/dataViz/comparisonBarChart/cityIndustryComparisonQuery";
import { createRoute } from "../../../../../routing/Utils";
import TrackedRoute from "../../../../../routing/TrackedRoute";
import {
  CityRoutes,
  cityIdParam,
  ColorBy,
} from "../../../../../routing/routes";
import { useHistory, Switch, matchPath } from "react-router-dom";
import SideText from "../SideText";

interface Props {
  primaryCity: string;
  secondaryCity: string;
  hiddenSectors: string[];
  clusterLevel: ClusterLevel;
  isClusterView: boolean;
  hiddenClusters: ClassificationNaicsCluster["id"][];
  colorBy: ColorBy;
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity,
    secondaryCity,
    hiddenSectors,
    clusterLevel,
    isClusterView,
    hiddenClusters,
    colorBy,
  } = props;

  const { digit_level, composition_type } = useQueryParams();
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const history = useHistory();
  const isIndustryComparison = matchPath<{ [cityIdParam]: string }>(
    history.location.pathname,
    CityRoutes.CityGoodAtAbsolutePresenceComparison,
  );
  const vizNavigation = [
    {
      label: "Bar Graph",
      active: !!(!isIndustryComparison || !isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGoodAtAbsolutePresence, primaryCity) +
            history.location.search,
        );
      },
    },
    {
      label: "Nested Bar Graph",
      active: !!(isIndustryComparison && isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(
            CityRoutes.CityGoodAtAbsolutePresenceComparison,
            primaryCity,
          ) + history.location.search,
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
        <TrackedRoute
          path={CityRoutes.CityGoodAtAbsolutePresenceComparison}
          render={() => (
            <>
              <SideText
                isClusterView={Boolean(isClusterView)}
                prefix={"absolute-nested-bar-chart"}
              />
              <IndustryZoomableBarChart
                primaryCity={parseInt(primaryCity, 10)}
                comparison={comparison}
                year={defaultYear}
                setHighlighted={setHighlighted}
                highlighted={highlighted ? parseInt(highlighted, 10) : null}
                compositionType={
                  composition_type
                    ? (composition_type as CompositionType)
                    : defaultCompositionType
                }
                hiddenSectors={hiddenSectors}
                vizNavigation={vizNavigation}
                isClusterView={isClusterView}
                hiddenClusters={hiddenClusters}
              />
            </>
          )}
        />
        <TrackedRoute
          path={CityRoutes.CityGoodAtAbsolutePresence}
          render={() => (
            <>
              <SideText
                isClusterView={Boolean(isClusterView)}
                prefix={"absolute-presence"}
              />
              <TopIndustryComparisonBarChart
                primaryCity={parseInt(primaryCity, 10)}
                comparison={comparison}
                year={defaultYear}
                setHighlighted={setHighlighted}
                highlighted={highlighted}
                digitLevel={
                  digit_level ? parseInt(digit_level, 10) : defaultDigitLevel
                }
                compositionType={
                  composition_type
                    ? (composition_type as CompositionType)
                    : defaultCompositionType
                }
                hiddenSectors={hiddenSectors}
                vizNavigation={vizNavigation}
                clusterLevel={clusterLevel}
                isClusterView={isClusterView}
                hiddenClusters={hiddenClusters}
                colorBy={colorBy}
              />
            </>
          )}
        />
      </Switch>
    </>
  );
};

export default CompositionComparison;
