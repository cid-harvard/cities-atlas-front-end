import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
  CompositionType,
  defaultCompositionType,
} from '../../../../types/graphQL/graphQLTypes';
import {
  ContentGrid,
} from '../../../../styling/styleUtils';
import useQueryParams from '../../../../hooks/useQueryParams';
import useFluent from '../../../../hooks/useFluent';
import CategoryLabels from '../../../../components/dataViz/legend/CategoryLabels';
import EducationLegend from '../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../components/dataViz/legend/WageLegend';
import useSectorMap from '../../../../hooks/useSectorMap';
import useClusterMap from '../../../../hooks/useClusterMap';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {
  ColorBy,
  defaultClusterLevel,
  defaultColorBy,
  AggregationMode,
  defaultAggregationMode,
} from '../../../../routing/routes';
import RCABarChart from '../../../../components/dataViz/verticalBarChart/RCABarChart';
import {defaultDigitLevel} from '../../../../types/graphQL/graphQLTypes';
import SideText from './SideText';

const CityGoodAt = () => {
  const cityId = useCurrentCityId();

  const {cluster_level, digit_level, color_by, aggregation, composition_type} = useQueryParams();
  const sectorMap = useSectorMap();
  const clusterMap = useClusterMap();
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const [hiddenClusters, setHiddenClusters] = useState<ClassificationNaicsCluster['id'][]>([]);
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);
  const resetSectors = () => setHiddenSectors([]);

  const toggleCluster = (clusterId: ClassificationNaicsCluster['id']) =>
    hiddenClusters.includes(clusterId)
      ? setHiddenClusters(hiddenClusters.filter(sId => sId !== clusterId))
      : setHiddenClusters([...hiddenClusters, clusterId]);
  const isolateCluster = (clusterId: ClassificationNaicsCluster['id']) =>
    hiddenClusters.length === clusterMap.length - 1 && !hiddenClusters.find(sId => sId === clusterId)
      ? setHiddenClusters([])
      : setHiddenClusters([...clusterMap.map(s => s.id).filter(sId => sId !== clusterId)]);
  const resetClusters = () => setHiddenClusters([]);

  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const getString = useFluent();

  const isClusterView =
    (!aggregation && defaultAggregationMode === AggregationMode.cluster) || (aggregation === AggregationMode.cluster);

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  let legend: React.ReactElement<any> | null;
  if (color_by === ColorBy.education) {
    legend = (
      <EducationLegend />
    );
  } else if (color_by === ColorBy.wage) {
    legend = (
      <WageLegend />
    );
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
          resetText={getString('global-ui-reset-clusters')}
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
          resetText={getString('global-ui-reset-sectors')}
          fullWidth={true}
        />
      );
    }
  }

  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <SideText
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
          isCluster={Boolean(isClusterView)}
        />
        <RCABarChart
          isClusterView={Boolean(isClusterView)}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          hiddenSectors={hiddenSectors}
          hiddenClusters={hiddenClusters}
          clusterLevel={cluster_level ? cluster_level : defaultClusterLevel}
          digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
          colorBy={color_by ? color_by : defaultColorBy}
        />
        {legend}
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default CityGoodAt;
