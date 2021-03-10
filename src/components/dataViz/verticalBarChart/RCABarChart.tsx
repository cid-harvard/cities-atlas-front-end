import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  usePrevious,
} from 'react-use';
import {useWindowWidth} from '../../../contextProviders/appContext';
import {breakPoints} from '../../../styling/GlobalGrid';
import {
  baseColor,
} from '../../../styling/styleUtils';
import PreChartRow, {VizNavStyle} from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import useRCAData, {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  useHistory,
} from 'react-router-dom';
import Industries from './Industries';
import Clusters from './Clusters';
import {
  CityRoutes,
  ColorBy,
} from '../../../routing/routes';
import {createRoute} from '../../../routing/Utils';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import useFluent from '../../../hooks/useFluent';
import {ClusterLevel} from '../../../routing/routes';
import useColorByIntensity from '../treeMap/useColorByIntensity';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 3.5rem 1fr;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const LeftAxisRoot = styled.div`
  grid-row: 1;
  grid-column: 1;
  white-space: nowrap;
  display: flex;
  transform: rotate(-90deg);
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const AxisLabelBase = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${baseColor};
  text-transform: uppercase;
`;

const AxisLabelHigh = styled(AxisLabelBase)`
  margin-left: 3rem;
`;

const VizRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  grid-column: 2;
  grid-row: 1;
`;

const VizContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  .react-comparison-bar-chart-title {
    h2 {
      text-transform: none;
    }
  }
`;

interface Props {
  isClusterView: boolean;
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  hiddenClusters: ClassificationNaicsCluster['id'][];
  clusterLevel: ClusterLevel;
  digitLevel: DigitLevel;
  colorBy: ColorBy;
}

const RCABarChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted,
    highlighted, compositionType,
    isClusterView, clusterLevel,
    digitLevel, colorBy, hiddenClusters,
  } = props;
  const cityId = useCurrentCityId();
  const getString = useFluent();
  const history = useHistory();
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const {loading, error, data} = useRCAData(digitLevel);
  const intensity = useColorByIntensity({digitLevel, colorBy, compositionType});

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);

  const prevData = usePrevious(data);
  let dataToUse: SuccessResponse | undefined;
  if (data) {
    dataToUse = data;
  } else if (prevData) {
    dataToUse = prevData;
  } else {
    dataToUse = undefined;
  }

  let output: React.ReactElement<any> | null;
  if (industryMap.loading || !dimensions || (loading && prevData === undefined) ||
      (colorBy === ColorBy.intensity && intensity.loading)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  }  else if (industryMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (intensity.error !== undefined && colorBy === ColorBy.intensity) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(intensity.error);
  } else if (dataToUse !== undefined) {
    const clusterData = dataToUse.clusterRca;
    const industryData = dataToUse.nodeRca;
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    const viz = isClusterView ? (
      <Clusters
        key={'ClustersRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={clusterData}
        compositionType={compositionType}
        clusterLevel={clusterLevel}
        colorBy={colorBy}
        hiddenClusters={hiddenClusters}
      />
    ) : (
      <Industries
        key={'IndustriesRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={industryData}
        highlighted={highlighted}
        compositionType={compositionType}
        hiddenSectors={hiddenSectors}
        colorBy={colorBy}
        digitLevel={digitLevel}
      />
    );
    output = (
      <VizContainer style={{height: dimensions.height}}>
          <ErrorBoundary>
            {viz}
          </ErrorBoundary>
        {loadingOverlay}
      </VizContainer>
    );
  } else {
    output = null;
  }

  const industriesUrl = cityId ? createRoute.city(CityRoutes.CityGoodAt, cityId) + history.location.search : '';
  const clustersUrl = cityId ? createRoute.city(CityRoutes.CityGoodAtClusters, cityId) + history.location.search : '';

  const vizNavigation = [
    {
      label: 'Industry Groups',
      active: !isClusterView,
      onClick: () => {
        setHighlighted(undefined);
        history.push(industriesUrl);
      },
    },
    {
      label: 'Knowledge Clusters',
      active: isClusterView,
      onClick: () => {
        setHighlighted(undefined);
        history.push(clustersUrl);
      },
      tooltipContent: 'About Knowledge Clusters',
    },
  ];

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{hiddenSectors, digitLevel, setHighlighted}}
        settingsOptions={{
          compositionType: true,
          clusterLevel: isClusterView ? {
            disabledOptions: [ClusterLevel.C1],
          } : undefined,
          digitLevel: isClusterView ? undefined : true,
          colorBy: true,
        }}
        vizNavigation={vizNavigation}
        vizNavigationStyle={VizNavStyle.Underline}
      />
      <Root>
        <LeftAxisRoot>
          <AxisLabelBase>← {getString('global-intensity-lower')}</AxisLabelBase>
          <AxisLabelHigh>{getString('global-intensity-higher')} →</AxisLabelHigh>
        </LeftAxisRoot>
        <VizRoot ref={rootRef}>
          {output}
        </VizRoot>
      </Root>
    </>
  );
};

export default RCABarChart;