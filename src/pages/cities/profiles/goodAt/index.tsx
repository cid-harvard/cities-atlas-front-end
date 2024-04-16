import { DefaultContentWrapper } from "../../../../styling/GlobalGrid";
import useCurrentCityId from "../../../../hooks/useCurrentCityId";
import SimpleError from "../../../../components/transitionStateComponents/SimpleError";
import { LoadingOverlay } from "../../../../components/transitionStateComponents/VizLoadingBlock";
import React, { useState } from "react";
import {
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
} from "../../../../types/graphQL/graphQLTypes";
import { ContentGrid } from "../../../../styling/styleUtils";
import useQueryParams from "../../../../hooks/useQueryParams";
import useFluent from "../../../../hooks/useFluent";
import CategoryLabels from "../../../../components/dataViz/legend/CategoryLabels";
import EducationLegend from "../../../../components/dataViz/legend/EducationLegend";
import WageLegend from "../../../../components/dataViz/legend/WageLegend";
import useSectorMap from "../../../../hooks/useSectorMap";
import useClusterMap from "../../../../hooks/useClusterMap";
import UtilityBar from "../../../../components/navigation/secondaryHeader/UtilityBar";
import {
  ColorBy,
  defaultClusterLevel,
  defaultColorBy,
  AggregationMode,
  defaultAggregationMode,
  CityRoutes,
  Routes,
} from "../../../../routing/routes";
import RCABarChart from "../../../../components/dataViz/verticalBarChart/RCABarChart";
import { defaultDigitLevel } from "../../../../types/graphQL/graphQLTypes";
import SideText from "./SideText";
import { Switch } from "react-router-dom";
import TrackedRoute from "../../../../routing/TrackedRoute";
import AbsolutePresence from "./absolutePresence";
import useCurrentBenchmark from "../../../../hooks/useCurrentBenchmark";
import { useRouteMatch } from "react-router-dom";

const CityGoodAt = () => {
  const cityId = useCurrentCityId();

  const { cluster_level, digit_level, color_by, aggregation } =
    useQueryParams();
  const { benchmark } = useCurrentBenchmark();
  const sectorMap = useSectorMap();
  const clusterMap = useClusterMap();
  const matchZoomableBarChart = useRouteMatch(
    Routes.CityGoodAtAbsolutePresenceComparison,
  );
  const [hiddenSectors, setHiddenSectors] = useState<
    ClassificationNaicsIndustry["id"][]
  >([]);
  const [hiddenClusters, setHiddenClusters] = useState<
    ClassificationNaicsCluster["id"][]
  >([]);
  const toggleSector = (sectorId: ClassificationNaicsIndustry["id"]) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter((sId) => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry["id"]) =>
    hiddenSectors.length === sectorMap.length - 1 &&
    !hiddenSectors.find((sId) => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([
          ...sectorMap.map((s) => s.id).filter((sId) => sId !== sectorId),
        ]);
  const resetSectors = () => setHiddenSectors([]);

  const toggleCluster = (clusterId: ClassificationNaicsCluster["id"]) =>
    hiddenClusters.includes(clusterId)
      ? setHiddenClusters(hiddenClusters.filter((sId) => sId !== clusterId))
      : setHiddenClusters([...hiddenClusters, clusterId]);
  const isolateCluster = (clusterId: ClassificationNaicsCluster["id"]) =>
    hiddenClusters.length === clusterMap.length - 1 &&
    !hiddenClusters.find((sId) => sId === clusterId)
      ? setHiddenClusters([])
      : setHiddenClusters([
          ...clusterMap.map((s) => s.id).filter((sId) => sId !== clusterId),
        ]);
  const resetClusters = () => setHiddenClusters([]);

  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const getString = useFluent();

  const isClusterView =
    (!aggregation && defaultAggregationMode === AggregationMode.cluster) ||
    aggregation === AggregationMode.cluster;

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={"global-ui-error-invalid-city"} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  let legend: React.ReactElement<any> | null;
  if (color_by === ColorBy.education && !matchZoomableBarChart) {
    legend = <EducationLegend />;
  } else if (color_by === ColorBy.wage && !matchZoomableBarChart) {
    legend = <WageLegend />;
  } else {
    if (isClusterView) {
      legend = (
        <CategoryLabels
          categories={clusterMap}
          allowToggle={true}
          toggleCategory={toggleCluster}
          isolateCategory={isolateCluster}
          hiddenCategories={hiddenClusters}
          resetCategories={resetClusters}
          resetText={getString("global-ui-reset-clusters")}
          fullWidth={false}
        />
      );
    } else {
      legend = (
        <CategoryLabels
          categories={sectorMap}
          allowToggle={true}
          toggleCategory={toggleSector}
          isolateCategory={isolateSector}
          hiddenCategories={hiddenSectors}
          resetCategories={resetSectors}
          resetText={getString("global-ui-reset-sectors")}
          fullWidth={true}
        />
      );
    }
  }

  const clusterLevel = cluster_level ? cluster_level : defaultClusterLevel;
  const digitLevel = digit_level
    ? parseInt(digit_level, 10)
    : defaultDigitLevel;
  const colorBy = color_by ? color_by : defaultColorBy;

  return (
    <DefaultContentWrapper>
      <ContentGrid>
        <Switch>
          <TrackedRoute
            path={CityRoutes.CityGoodAtAbsolutePresence}
            render={() => (
              <>
                <AbsolutePresence
                  primaryCity={cityId}
                  secondaryCity={benchmark}
                  hiddenSectors={hiddenSectors}
                  clusterLevel={clusterLevel}
                  isClusterView={isClusterView}
                  hiddenClusters={hiddenClusters}
                  colorBy={colorBy}
                />
              </>
            )}
          />
          <TrackedRoute
            path={CityRoutes.CityGoodAt}
            render={() => (
              <>
                <SideText
                  isClusterView={Boolean(isClusterView)}
                  prefix={"relative-presence"}
                />
                <RCABarChart
                  isClusterView={Boolean(isClusterView)}
                  highlighted={highlighted}
                  setHighlighted={setHighlighted}
                  hiddenSectors={hiddenSectors}
                  hiddenClusters={hiddenClusters}
                  clusterLevel={clusterLevel}
                  digitLevel={digitLevel}
                  colorBy={colorBy}
                />
              </>
            )}
          />
        </Switch>
        {legend}
      </ContentGrid>
      <UtilityBar />
    </DefaultContentWrapper>
  );
};

export default CityGoodAt;
