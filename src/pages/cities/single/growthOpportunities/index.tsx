import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  DigitLevel,
  defaultDigitLevel,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
  ClusterLevel,
  CompositionType,
  defaultCompositionType,
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
import useSectorMap from '../../../../hooks/useSectorMap';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {createRoute} from '../../../../routing/Utils';
import {
  CityRoutes,
  cityIdParam,
  ColorBy,
  AggregationMode,
  defaultAggregationMode,
} from '../../../../routing/routes';
import {
  useHistory,
  Switch,
  Route,
  matchPath,
} from 'react-router-dom';
import NAICSChart from '../../../../components/dataViz/pswotChart/NAICSChart';
import ClusterChart from '../../../../components/dataViz/pswotChart/ClusterChart';
import IntensityLegend from '../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../components/dataViz/legend/WageLegend';
import useClusterMap from '../../../../hooks/useClusterMap';
import PreChartRow from '../../../../components/general/PreChartRow';
import {Mode} from '../../../../components/general/searchIndustryInGraphDropdown';
import PSWOTTable from '../../../../components/dataViz/pswotTable';

const GrowthOppurtunities = () => {
  const cityId = useCurrentCityId();

  const {node_sizing, color_by, digit_level, aggregation, cluster_level, composition_type} = useQueryParams();
  const digitLevel = digit_level ? parseInt(digit_level, 10) as DigitLevel : defaultDigitLevel;
  const clusterLevel = cluster_level ? parseInt(cluster_level, 10) as ClusterLevel : ClusterLevel.C3;
  const compositionType = composition_type ? composition_type as CompositionType : defaultCompositionType;
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
  const isTableView = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityGrowthOpportunitiesTable,
  );

  const isClusterMode =
    (!aggregation && defaultAggregationMode === AggregationMode.cluster) || (aggregation === AggregationMode.cluster);

  const vizNavigation= [
    {
      label: 'Scatter Plot',
      active: !!(!isTableView || !isTableView.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGrowthOpportunities, cityId ? cityId :'')
          + history.location.search,
        );
      },
    },
    {
      label: 'Table of Industries',
      active: !!(isTableView && isTableView.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGrowthOpportunitiesTable, cityId ? cityId :'')
          + history.location.search,
        );
      },
    },
  ];

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
    if (isClusterMode) {
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


  const pswotChart = isClusterMode ? (
      <ClusterChart
        highlighted={highlighted ? highlighted : null}
        setHighlighted={setHighlighted}
        clusterLevel={clusterLevel}
        hiddenClusters={hiddenClusters}
        nodeSizing={node_sizing}
        colorBy={color_by ? color_by : ColorBy.sector}
        compositionType={compositionType}
      />
  ) : (
      <NAICSChart
        highlighted={highlighted ? highlighted : null}
        setHighlighted={setHighlighted}
        digitLevel={digitLevel}
        hiddenSectors={hiddenSectors}
        nodeSizing={node_sizing}
        colorBy={color_by ? color_by : ColorBy.sector}
        compositionType={compositionType}
      />
  );

  const pswotChartWithSettings = (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: isClusterMode ? hiddenClusters : hiddenSectors,
          digitLevel: isClusterMode ? null : digitLevel,
          clusterLevel: isClusterMode ? clusterLevel.toString() as any : null,
          setHighlighted,
          mode: isClusterMode ? Mode.cluster : Mode.naics,
        }}
        settingsOptions={{
          compositionType: true,
          nodeSizing: true,
          colorBy: {nodes: true},
          aggregationMode: true,
          digitLevel: isClusterMode ? undefined : true,
          clusterLevel: isClusterMode ? true : undefined,
        }}
        vizNavigation={vizNavigation}
      />
      {pswotChart}
    </>
  );

  const pswotTable = (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: isClusterMode ? hiddenClusters : hiddenSectors,
          digitLevel: isClusterMode ? null : digitLevel,
          clusterLevel: isClusterMode ? clusterLevel.toString() as any : null,
          setHighlighted,
          mode: isClusterMode ? Mode.cluster : Mode.naics,
        }}
        settingsOptions={{
          compositionType: true,
          aggregationMode: true,
          digitLevel: isClusterMode ? undefined : true,
          clusterLevel: isClusterMode ? true : undefined,
        }}
        vizNavigation={vizNavigation}
      />
      <PSWOTTable
        clusterLevel={clusterLevel}
        digitLevel={digitLevel}
        compositionType={compositionType}
        aggregationMode={isClusterMode ? AggregationMode.cluster : AggregationMode.industries}
        hiddenSectors={hiddenSectors}
        hiddenClusters={hiddenClusters}
      />
    </>
  );


  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What are the Growth Opportunities in my City?</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>{'Building on all these measures, we can rank industries not only by their relative size in <City>, but by their predicted future growth. These measures can help analysts make sense not only of <City>\'s economic strengths and weaknesses, but to assess growth opportunities and contraction threats. <City>\'s strengths concentrate in sector <Sec>, while its weaknesses concentrate in <Sec>. <City> has great opportunities in <Sec>, but faces threats in <Sec>.'}</ContentParagraph>
        </StandardSideTextBlock>
        <Switch>
          <Route path={CityRoutes.CityGrowthOpportunitiesTable}
            render={() => (<>{pswotTable}</>)}
          />
          <Route path={CityRoutes.CityGrowthOpportunities}
            render={() => (<>{pswotChartWithSettings}</>)}
          />
        </Switch>
        {legend}
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default GrowthOppurtunities;
