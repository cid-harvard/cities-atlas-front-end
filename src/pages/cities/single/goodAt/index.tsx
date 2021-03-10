import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  defaultCompositionType,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
} from '../../../../types/graphQL/graphQLTypes';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import useQueryParams from '../../../../hooks/useQueryParams';
import useFluent from '../../../../hooks/useFluent';
import CategoryLabels from '../../../../components/dataViz/legend/CategoryLabels';
import IntensityLegend from '../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../components/dataViz/legend/WageLegend';
import useSectorMap from '../../../../hooks/useSectorMap';
import useClusterMap from '../../../../hooks/useClusterMap';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {
  CityRoutes,
  cityIdParam,
  ColorBy,
  defaultClusterLevel,
  defaultColorBy,
} from '../../../../routing/routes';
import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import RCABarChart from '../../../../components/dataViz/verticalBarChart/RCABarChart';
import {defaultDigitLevel} from '../../../../types/graphQL/graphQLTypes';

const CityGoodAt = () => {
  const cityId = useCurrentCityId();

  const {composition_type, cluster_level, digit_level, color_by} = useQueryParams();
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
  const history = useHistory();
  const isClusterView = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityGoodAtClusters,
  );

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
  if (color_by === ColorBy.intensity) {
    legend = (
      <IntensityLegend />
    );
  } else if (color_by === ColorBy.education) {
    legend = (
      <EducationLegend />
    );
  } else if (color_by === ColorBy.wage) {
    legend = (
      <WageLegend />
    );
  } else {
    if (!!(isClusterView && isClusterView.isExact)) {
      legend = (
        <CategoryLabels
          categories={clusterMap}
          allowToggle={true}
          toggleCategory={toggleCluster}
          isolateCategory={isolateCluster}
          hiddenCategories={hiddenClusters}
          resetCategories={resetClusters}
          resetText={getString('global-ui-reset-clusters')}
          fullWidth={true}
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
        <StandardSideTextBlock>
          <ContentTitle>What does my City specialize in?</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>{'Considering the aggregated share of employment/establishments of each industry in all of <reference regions>, we can assess which industries in  <City> concentrate a higher share of employment/establishments, implying  that the city displays a relative advantage. <City> display the strongest relative advantage in <Ind>, <Ind> and <Ind>. Overall, <City> shows a stronger advantage in the <Sec> sector. At the opposite end, <City> is relatively lower presence in industries in the <Sec> sector.'}</ContentParagraph>
        </StandardSideTextBlock>
        <RCABarChart
          isClusterView={Boolean(isClusterView)}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          compositionType={composition_type ? composition_type : defaultCompositionType}
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
