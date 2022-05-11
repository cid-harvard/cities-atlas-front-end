import React, {useState, useRef, useCallback, useEffect} from 'react';
import UtilityBar, {DownloadType} from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import CompositionTreeMap from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import ClusterCompositionTreeMap from '../../../../../components/dataViz/treeMap/ClusterCompositionTreeMap';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';
import {
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
  CompositionType,
  defaultDigitLevel,
  defaultCompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import styled from 'styled-components/macro';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useSectorMap from '../../../../../hooks/useSectorMap';
import useClusterMap from '../../../../../hooks/useClusterMap';
import DownloadImageOverlay from './DownloadImageOverlay';
import useQueryParams from '../../../../../hooks/useQueryParams';
import useFluent from '../../../../../hooks/useFluent';
import EducationLegend from '../../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../../components/dataViz/legend/WageLegend';
import {
  ColorBy,
  AggregationMode,
  defaultAggregationMode,
  ClusterLevel,
  defaultClusterLevel,
} from '../../../../../routing/routes';
import PreChartRow, {Indicator} from '../../../../../components/general/PreChartRow';
import {usePrevious} from 'react-use';
import {Mode} from '../../../../../components/general/searchIndustryInGraphDropdown';
import SideText from './SideText';

const TreeMapRoot = styled.div`
  display: contents;
`;

interface Props {
  cityId: string;
}

const EconomicComposition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const clearHighlighted = useCallback(() => setHighlighted(undefined), [setHighlighted]);
  const prevHighlighted = usePrevious(highlighted);
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const [hiddenClusters, setHiddenClusters] = useState<ClassificationNaicsCluster['id'][]>([]);
  const {digit_level, cluster_level, composition_type, color_by, aggregation} = useQueryParams();
  const compositionType= composition_type ? composition_type as CompositionType : defaultCompositionType;
  const sectorMap = useSectorMap();
  const clusterMap = useClusterMap();

  useEffect(() => clearHighlighted, [digit_level, clearHighlighted]);

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

  const [activeDownload, setActiveDownload] = useState<DownloadType | null>(null);
  const closeDownload = () => setActiveDownload(null);

  const [indicatorContent, setIndicatorContent] = useState<Indicator>({
    text: undefined,
    tooltipContent: undefined,
  });

  const treeMapRef = useRef<HTMLDivElement | null>(null);
  const globalLocationData = useGlobalLocationData();
  const getString = useFluent();

  const isClusterTreeMap =
    (!aggregation && defaultAggregationMode === AggregationMode.cluster) || (aggregation === AggregationMode.cluster);

  let download: React.ReactElement<any> | null;
  if (activeDownload === DownloadType.Image && treeMapRef.current) {
    const cellsNode = treeMapRef.current.querySelector('div.react-canvas-tree-map-masterContainer');
    if (cellsNode) {
      const targetCity = globalLocationData.data && globalLocationData.data.cities.find(c => c.cityId === cityId);
      download = (
        <DownloadImageOverlay
          onClose={closeDownload}
          cityId={parseInt(cityId, 10)}
          cityName={targetCity && targetCity.name ? targetCity.name : undefined}
          year={defaultYear}
          digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
          clusterLevel={cluster_level ? cluster_level : defaultClusterLevel}
          aggregationMode={isClusterTreeMap ? AggregationMode.cluster : AggregationMode.industries}
          colorBy={color_by ? color_by : ColorBy.sector}
          compositionType={compositionType}
          hiddenClusters={hiddenClusters}
          hiddenSectors={hiddenSectors}
          treeMapCellsNode={cellsNode as HTMLDivElement}
        />
      );
    } else {
      download = null;
      setActiveDownload(null);
    }
  } else {
    download = null;
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
  } else  {
    if (isClusterTreeMap) {
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

  const treeMapViz = isClusterTreeMap ? (
    <ClusterCompositionTreeMap
      cityId={parseInt(cityId, 10)}
      year={defaultYear}
      clusterLevel={cluster_level ? cluster_level : defaultClusterLevel}
      colorBy={color_by ? color_by : ColorBy.sector}
      compositionType={compositionType}
      highlighted={highlighted}
      clearHighlighted={clearHighlighted}
      hiddenClusters={hiddenClusters}
      setIndicatorContent={setIndicatorContent}
    />
  ) : (
    <CompositionTreeMap
      cityId={parseInt(cityId, 10)}
      year={defaultYear}
      digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
      colorBy={color_by ? color_by : ColorBy.sector}
      compositionType={compositionType}
      highlighted={highlighted}
      clearHighlighted={clearHighlighted}
      hiddenSectors={hiddenSectors}
      setIndicatorContent={setIndicatorContent}
    />
  );

  return (
    <>
      <ContentGrid>
        <SideText
          cityId={parseInt(cityId, 10)}
          year={defaultYear}
          compositionType={compositionType}
        />
        <TreeMapRoot ref={treeMapRef}>
          <PreChartRow
            key={'tree-map-search-' + Boolean(!highlighted && prevHighlighted)}
            indicator={compositionType === CompositionType.Employees ? indicatorContent : undefined}
            searchInGraphOptions={{
              hiddenParents: isClusterTreeMap ? hiddenClusters : hiddenSectors,
              digitLevel: isClusterTreeMap ? null : digit_level ? parseInt(digit_level, 10) : defaultDigitLevel,
              clusterLevel: isClusterTreeMap
                ? cluster_level ? parseInt(cluster_level, 10).toString() as ClusterLevel : defaultClusterLevel : null,
              setHighlighted,
              mode: isClusterTreeMap ? Mode.cluster : Mode.naics,
            }}
            settingsOptions={{
              compositionType: true,
              colorBy: true,
              aggregationMode: true,
              clusterLevel: isClusterTreeMap ? true : undefined,
              digitLevel: isClusterTreeMap ? undefined : true,
            }}
          />
          {treeMapViz}
        </TreeMapRoot>
        {legend}
        {download}
      </ContentGrid>

      <UtilityBar
        onDownloadImageButtonClick={() => setActiveDownload(DownloadType.Image)}
      />
    </>
  );
};

export default EconomicComposition;
