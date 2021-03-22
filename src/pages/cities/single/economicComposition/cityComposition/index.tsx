import React, {useState, useRef} from 'react';
import UtiltyBar, {DownloadType} from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import CompositionTreeMap from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import ClusterCompositionTreeMap from '../../../../../components/dataViz/treeMap/ClusterCompositionTreeMap';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../../styling/styleUtils';
import {
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
  CompositionType,
  defaultDigitLevel,
  defaultCompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import styled from 'styled-components/macro';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useSectorMap from '../../../../../hooks/useSectorMap';
import useClusterMap from '../../../../../hooks/useClusterMap';
import DownloadImageOverlay from './DownloadImageOverlay';
import noop from 'lodash/noop';
import useQueryParams from '../../../../../hooks/useQueryParams';
import useFluent from '../../../../../hooks/useFluent';
import {ColorBy, defaultClusterLevel} from '../../../../../routing/routes';
import IntensityLegend from '../../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../../components/dataViz/legend/WageLegend';
import {
  Switch,
  useHistory,
  matchPath,
  Route,
} from 'react-router-dom';
import {CityRoutes, cityIdParam} from '../../../../../routing/routes';
import {createRoute} from '../../../../../routing/Utils';

const TreeMapRoot = styled.div`
  display: contents;
`;

interface Props {
  cityId: string;
}

const EconomicComposition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const [hiddenClusters, setHiddenClusters] = useState<ClassificationNaicsCluster['id'][]>([]);
  const {digit_level, cluster_level, composition_type, color_by} = useQueryParams();
  const sectorMap = useSectorMap();
  const clusterMap = useClusterMap();

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
  const treeMapRef = useRef<HTMLDivElement | null>(null);
  const globalLocationData = useGlobalLocationData();
  const getString = useFluent();
  const history = useHistory();

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
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
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

  const isClusterTreeMap = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityEconomicCompositionClusters,
  );

  let legend: React.ReactElement<any> | null;
  if (color_by === ColorBy.education) {
    legend = (
      <EducationLegend />
    );
  } else if (color_by === ColorBy.wage) {
    legend = (
      <WageLegend />
    );
  } else if (color_by === ColorBy.intensity) {
    legend = (
      <IntensityLegend />
    );
  } else  {
    if (!!(isClusterTreeMap && isClusterTreeMap.isExact)) {
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

  const vizNavigation= [
    {
      label: 'Industry Groups',
      active: !!(!isClusterTreeMap || !isClusterTreeMap.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityEconomicComposition, cityId)
          + history.location.search,
        );
      },
    },
    {
      label: 'Knowledge Clusters',
      active: !!(isClusterTreeMap && isClusterTreeMap.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityEconomicCompositionClusters, cityId)
          + history.location.search,
        );
      },
      tooltipContent: 'About Knowledge Clusters',
    },
  ];

  return (
    <>
      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What is my city's economic composition?</ContentTitle>

          {/* eslint-disable-next-line */}
          <ContentParagraph>{'<City> is a <y-level> income level city in <Country>. As of <year>, the population of <City> was <XX> million people and its GDP was <XX>. It is the <XX> largest city and <XX> richest city in <Benchmark Region>. <City>’s workforce is made of <XX> workers spread throughout <XX> economic establishments. It’s workforce captures <XX> out of every 100 citizens - the <XX> largest in <Benchmark Region>.'}</ContentParagraph>
          {/* eslint-disable-next-line */}
          <ContentParagraph>{'<City>’s economy is concentrated in <Sector> industries (<XX%> of all employment/establishments) such as <Industry> (<XX%>). Similarly, it shows a high participation in <Sector> (<XX%>), in industries such as <XX> (<YY%>).'}</ContentParagraph>

        </StandardSideTextBlock>
        <TreeMapRoot ref={treeMapRef}>
          <Switch>
            <Route path={CityRoutes.CityEconomicCompositionClusters}
              render={() => (
                <ClusterCompositionTreeMap
                  cityId={parseInt(cityId, 10)}
                  year={defaultYear}
                  clusterLevel={cluster_level ? cluster_level : defaultClusterLevel}
                  colorBy={color_by ? color_by : ColorBy.sector}
                  compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
                  highlighted={highlighted}
                  hiddenClusters={hiddenClusters}
                  setHighlighted={setHighlighted}
                  vizNavigation={vizNavigation}
                />
              )}
            />
            <Route path={CityRoutes.CityEconomicComposition}
              render={() => (
                <CompositionTreeMap
                  cityId={parseInt(cityId, 10)}
                  year={defaultYear}
                  digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
                  colorBy={color_by ? color_by : ColorBy.sector}
                  compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
                  highlighted={highlighted}
                  hiddenSectors={hiddenSectors}
                  setHighlighted={setHighlighted}
                  vizNavigation={vizNavigation}
                />
              )}
            />
          </Switch>
        </TreeMapRoot>
        {legend}
        {download}
      </ContentGrid>
      <UtiltyBar
        onDownloadImageButtonClick={() => setActiveDownload(DownloadType.Image)}
        onDownloadDataButtonClick={noop}
      />
    </>
  );
};

export default EconomicComposition;
