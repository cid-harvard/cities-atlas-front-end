import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
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
  primaryColor,
  primaryColorLight,
  baseColor,
} from '../../../styling/styleUtils';
import PreChartRow from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import useRCAData, {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  Link,
  useHistory,
} from 'react-router-dom';
import Industries from './Industries';
import Clusters from './Clusters';
import {
  CityRoutes,
} from '../../../routing/routes';
import {createRoute} from '../../../routing/Utils';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import useFluent from '../../../hooks/useFluent';
import {ClusterLevel} from '../../../routing/routes';
import Tooltip from './../../general/Tooltip';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 2rem 1fr;
  grid-template-columns: 3.5rem 1fr;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const VizNavRoot = styled.div`
  grid-row: 1;
  grid-column: 2;
`;

const LeftAxisRoot = styled.div`
  grid-row: 2;
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
  grid-row: 2;
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

const ClusterLinkContainer = styled.span`
  display: inline-flex;
  margin-left: 1rem;
`;

const NavLink = styled(Link)`
  border-bottom: solid 4px rgba(0, 0, 0, 0);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${baseColor};
  text-decoration: none;

  &:hover {
    border-bottom-color: ${primaryColorLight};
  }
`;

const ActiveNavLink = styled(NavLink)`
  border-bottom-color: ${primaryColor};

  &:hover {
    border-bottom-color: ${primaryColor};
  }
`;

interface Props {
  isClusterView: boolean;
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  clusterLevel: ClusterLevel;
}

const RCABarChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted,
    highlighted, compositionType,
    isClusterView, clusterLevel,
  } = props;
  const cityId = useCurrentCityId();
  const getString = useFluent();
  const history = useHistory();
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const {loading, error, data} = useRCAData();
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
    const clusterData = dataToUse.clusterRca;
    const industryData = dataToUse.nodeRca;
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    const viz = isClusterView ? (
      <Clusters
        key={'ClustersRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={clusterData}
        compositionType={compositionType}
        clusterLevel={clusterLevel}
      />
    ) : (
      <Industries
        key={'IndustriesRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={industryData}
        highlighted={highlighted}
        compositionType={compositionType}
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

  const IndustryLink = isClusterView ? NavLink : ActiveNavLink;
  const ClusterLink = isClusterView ? ActiveNavLink : NavLink;

  const industriesUrl = cityId ? createRoute.city(CityRoutes.CityGoodAt, cityId) + history.location.search : '';
  const clustersUrl = cityId ? createRoute.city(CityRoutes.CityGoodAtClusters, cityId) + history.location.search : '';

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{hiddenSectors, digitLevel: DigitLevel.Six, setHighlighted}}
        settingsOptions={{compositionType: true, clusterLevel: isClusterView ? isClusterView : undefined}}
      />
      <Root>
        <VizNavRoot>
          <IndustryLink to={industriesUrl}>
            {getString('global-text-industries')}
          </IndustryLink>
          <ClusterLinkContainer>
            <ClusterLink to={clustersUrl}>
              {getString('global-ui-skill-clusters')}
            </ClusterLink>
            <Tooltip
              explanation={getString('global-ui-about-skill-clusters')}
            />
          </ClusterLinkContainer>
        </VizNavRoot>
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