import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
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
import PreChartRow from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import useRCAData, {SuccessResponse} from '../industrySpace/chart/useRCAData';
import Industries from './Industries';
import Clusters from './Clusters';
import {
  CityRoutes,
  ColorBy,
} from '../../../routing/routes';
import useFluent from '../../../hooks/useFluent';
import {ClusterLevel} from '../../../routing/routes';
import {Mode} from '../../general/searchIndustryInGraphDropdown';
import PresenceToggle, { Highlighted } from '../legend/PresenceToggle';
import BenchmarkLegend from '../legend/BenchmarkLegend';
import { ComparisonType } from '../../navigation/secondaryHeader/comparisons/AddComparisonModal';
import { useHistory } from 'react-router-dom';
import { createRoute } from '../../../routing/Utils';
import useCurrentCityId from '../../../hooks/useCurrentCityId';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 1fr 3rem auto;
  grid-template-columns: 3.5rem 1fr;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

export const LeftAxisRoot = styled.div`
  grid-row: 1;
  grid-column: 1;
  white-space: nowrap;
  display: flex;
  transform: rotate(-90deg);
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const BottomAxisRoot = styled.div`
  grid-row: 2;
  grid-column: 2;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding-left: 15%;
  padding-left: clamp(75px, 300px, 15%);

  @media (max-width: 1225px) {
    padding-left: 0;
    justify-content: flex-end;
  }
  @media (max-width: 990px) {
    grid-template-columns: 1 / -1;
  }

  @media (max-width: 920px) {
    padding-left: 15%;
    padding-left: clamp(75px, 300px, 15%);
    justify-content: center;
  }
`;

export const BenchmarkRoot = styled(BottomAxisRoot)`
  grid-row: 3;
  justify-content: center;
  white-space: normal;
`;

export const AxisLabelBase = styled.div`
  font-weight: 600;
  font-size: 0.75rem;
  color: ${baseColor};
  text-transform: uppercase;

  @media (max-width: 1000px) {
    font-size: 0.6rem;
  }

  @media (max-height: 600px) {
    font-size: 0.65rem;
  }
`;

export const AxisLabelLeft = styled(AxisLabelBase)`
  margin-right: 1rem;
  font-weight: 400;

  @media (max-width: 990px) {
    margin-right: 0.75rem;
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

export const AxisLabelRight = styled(AxisLabelBase)`
  margin-left: 1rem;
  font-weight: 400;

  @media (max-width: 990px) {
    margin-left: 0.75rem;
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

export const AxisLabelHigh = styled(AxisLabelBase)`
  margin-left: 3rem;

  @media (max-height: 800px) {
    margin-left: 1rem;
  }
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
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  hiddenClusters: ClassificationNaicsCluster['id'][];
  clusterLevel: ClusterLevel;
  digitLevel: DigitLevel;
  colorBy: ColorBy;
}

const RCABarChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted,
    highlighted,
    isClusterView, clusterLevel,
    digitLevel, colorBy, hiddenClusters,
  } = props;
  const getString = useFluent();
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const {loading, error, data} = useRCAData(digitLevel);
  const history = useHistory();
  const cityId = useCurrentCityId();

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
  if (industryMap.loading || !dimensions || (loading && prevData === undefined)) {
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
  } else if (dataToUse !== undefined) {
    const clusterData = clusterLevel === ClusterLevel.C1 ? dataToUse.c1Rca : dataToUse.c3Rca;
    const industryData = dataToUse.naicsRca;
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    const viz = isClusterView ? (
      <Clusters
        key={'ClustersRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={clusterData}
        clusterLevel={clusterLevel}
        colorBy={colorBy}
        hiddenClusters={hiddenClusters}
        highlighted={highlighted}
      />
    ) : (
      <Industries
        key={'IndustriesRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={industryData}
        highlighted={highlighted}
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

  const onButtonClick = (value: Highlighted) => {
    if (value === Highlighted.absolute && cityId !== null) {
      const route = createRoute.city(CityRoutes.CityGoodAtAbsolutePresence, cityId);
      history.push(route + history.location.search);
    }
  };

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: isClusterView ? hiddenClusters : hiddenSectors,
          digitLevel,
          clusterLevel,
          setHighlighted,
          mode: isClusterView ? Mode.cluster : Mode.naics,
        }}
        settingsOptions={{
          compositionType: true,
          clusterLevel: isClusterView ? true : undefined,
          digitLevel: isClusterView ? undefined : true,
          colorBy: true,
          aggregationMode: true,
        }}
      />
      <Root>
        <LeftAxisRoot>
          <AxisLabelBase>← {getString('global-intensity-lower')}</AxisLabelBase>
          <AxisLabelHigh>{getString('global-intensity-higher')} →</AxisLabelHigh>
        </LeftAxisRoot>
        <BottomAxisRoot>
          <AxisLabelLeft dangerouslySetInnerHTML={{__html: getString('relative-presence-axis-labels-bottom-left')}} />
          <AxisLabelBase>
            <PresenceToggle
              togglePresence={true}
              highlight={Highlighted.relative}
              showArrows={true}
              onButtonClick={onButtonClick}
            />
          </AxisLabelBase>
          <AxisLabelRight dangerouslySetInnerHTML={{__html: getString('relative-presence-axis-labels-bottom-right')}} />
        </BottomAxisRoot>
        <BenchmarkRoot>
          <BenchmarkLegend
            comparisonType={ComparisonType.Relative}
          />
        </BenchmarkRoot>
        <VizRoot ref={rootRef}>
          {output}
        </VizRoot>
      </Root>
    </>
  );
};

export default RCABarChart;