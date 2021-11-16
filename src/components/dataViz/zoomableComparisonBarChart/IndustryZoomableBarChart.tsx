import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
  CompositionType,
  isValidPeerGroup,
  PeerGroup,
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
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import {
  sectorColorMap,
  secondaryFont,
  baseColor,
  clusterColorMap,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import {
  ClusterBarChartDatum,
} from 'react-fast-charts';
import {
  useComparisonQuery,
  SuccessResponse,
  RegionGroup,
} from '../comparisonBarChart/cityIndustryComparisonQuery';
import orderBy from 'lodash/orderBy';
import {rgba} from 'polished';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';
import useFluent from '../../../hooks/useFluent';
import Chart, {Group} from './Chart';
import {Mode} from '../../general/searchIndustryInGraphDropdown';
import PresenceToggle, { Highlighted } from '../legend/PresenceToggle';
import { ComparisonType } from '../../navigation/secondaryHeader/comparisons/AddComparisonModal';
import BenchmarkLegend from '../legend/BenchmarkLegend';
import { AggregationMode, CityRoutes, ClusterLevel } from '../../../routing/routes';
import { createRoute } from '../../../routing/Utils';
import { useHistory } from 'react-router-dom';
import { useGlobalClusterMap } from '../../../hooks/useGlobalClusterData';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 4rem 2rem 1fr 3rem auto;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const BottomAxisRoot = styled.div`
  grid-row: 4;
  grid-column: 1;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 990px) {
    grid-template-columns: 1 / -1;
  }

  @media (max-width: 920px) {
    justify-content: center;
  }
`;

const BenchmarkRoot = styled(BottomAxisRoot)`
  grid-row: 5;
  justify-content: center;
  white-space: normal;
`;

const AxisLabelBase = styled.div`
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

const SizingContainer = styled.div`
  width: 100%;
  grid-row: 3;
`;

const VizContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  .cluster-bar-chart-y-axis-label {
    text-transform: uppercase;
    font-size: 0.75rem;
  }
`;

const BreadCrumbList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;

  @media ${breakPoints.small} {
    flex-wrap: wrap;
  }
`;

const breadCrumbFontSize = 'clamp(0.55rem, 0.9vw, 0.85rem)';

const BreadCrumb = styled.li`
  font-size: 0.6rem;
  font-size: ${breadCrumbFontSize};
  max-width: 20%;
  padding-right: 2rem;
  box-sizing: border-box;
  font-family: ${secondaryFont};
  position: relative;
`;

const BreadCrumbLink = styled.button`
  border: none;
  background-color: transparent;
  padding: 0;
  font-size: 0.6rem;
  font-size: ${breadCrumbFontSize};
  font-family: ${secondaryFont};
  color: rgb(78, 140, 141);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;

  span {
    text-decoration: underline;
  }

  &:after {
    content: '→';
    margin: 0 0.5rem;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
    position: absolute;
    right: 0;
  }
`;

const PrimarySecondaryLegend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendBlock = styled.div`
  width: 2em;
  height: 1rem;
  margin: 0 0.1rem;
`;

const LegendText = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  margin: 0 0.5rem;
`;

interface Props {
  primaryCity: number;
  comparison: number | RegionGroup | PeerGroup;
  year: number;
  highlighted: number | null;
  setHighlighted: (value: string | undefined) => void;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
  isClusterView: boolean;
  hiddenClusters: ClassificationNaicsCluster['id'][];
}

const IndustryZoomableBarChart = (props: Props) => {
  const {
    primaryCity, comparison, year, compositionType, highlighted,
    hiddenSectors, setHighlighted, vizNavigation,
    isClusterView, hiddenClusters,
  } = props;

  const {loading, error, data} = useComparisonQuery({
    primaryCity, comparison, year,
    aggregation: isClusterView ? AggregationMode.cluster : AggregationMode.industries,
  });
  const history = useHistory();
  const industryMap = useGlobalIndustryMap();
  const clusterMap = useGlobalClusterMap();
  const industryOrClusterMap = isClusterView ? clusterMap : industryMap;
  const parentField = isClusterView ? 'clusterIdTopParent' : 'naicsIdTopParent';
  const idField = isClusterView ? 'clusterId' : 'naicsId';
  const colorMap = isClusterView ? clusterColorMap : sectorColorMap;
  const hiddenIndustriesOrClusters = isClusterView ? hiddenClusters : hiddenSectors;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const getString = useFluent();
  const {data: globalData} = useGlobalLocationData();

  useEffect(() => {
    setHighlighted(undefined);
  }, [isClusterView, setHighlighted]);

  const primaryCityDatum = globalData
    ? globalData.cities.find(c => parseInt(c.cityId, 10) === primaryCity) : undefined;
  const primaryCityName = primaryCityDatum && primaryCityDatum.name? primaryCityDatum.name : '';

  let secondaryCityName: string;
  if (comparison === RegionGroup.World) {
    secondaryCityName = getString('global-text-world');
  } else if (isValidPeerGroup(comparison)) {
    secondaryCityName = getString('global-formatted-peer-groups', {type: comparison});
  } else {
    const secondaryCityDatum = globalData
      ? globalData.cities.find(c => parseInt(c.cityId, 10) === comparison) : undefined;
    secondaryCityName = secondaryCityDatum && secondaryCityDatum.name ? secondaryCityDatum.name : '';
  }

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);

  const highlightIndustry = highlighted ? industryOrClusterMap.data[highlighted] : undefined;

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
  if (industryOrClusterMap.loading || !dimensions || (loading && prevData === undefined)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (industryOrClusterMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {
      primaryCityIndustries, secondaryCityIndustries,
    } = dataToUse;
    const highlightedParent =
      (highlightIndustry && highlightIndustry.level === DigitLevel.Six) ||
      (isClusterView && highlightIndustry && highlightIndustry.level + '' === ClusterLevel.C3)
        ? highlightIndustry.parentId : highlighted;
    const primaryTotal = primaryCityIndustries.reduce((total, {industryId, numCompany, numEmploy}) => {
      const industry = industryOrClusterMap.data[industryId];
      if (industry && industry.parentId === null) {
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const increment = compositionType === CompositionType.Companies ? companies : employees;
        return total + increment;
      } else {
        return total;
      }
    }, 0);
    const secondaryTotal = secondaryCityIndustries.reduce((total, {industryId, numCompany, numEmploy}) => {
      const industry = industryMap.data[industryId];
      if (industry && industry.parentId === null) {
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const increment = compositionType === CompositionType.Companies ? companies : employees;
        return total + increment;
      } else {
        return total;
      }
    }, 0);
    const barChartData: ClusterBarChartDatum[] = [];
    [...primaryCityIndustries, ...secondaryCityIndustries].forEach(({industryId, numCompany, numEmploy}, i) => {
      const industry = industryOrClusterMap.data[industryId];
      if (
          industry && industry.name && industry.parentId === highlightedParent &&
          !hiddenIndustriesOrClusters.includes((industry as any)[parentField].toString())
        ) {
        const groupName = i < primaryCityIndustries.length ? Group.Primary : Group.Secondary;
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const colorDatum = colorMap.find(s => s.id === (industry as any)[parentField].toString());
        let fill: string | undefined;
        if (colorDatum) {
          fill = i < primaryCityIndustries.length ? colorDatum.color : rgba(colorDatum.color, 0.4);
        } else {
          fill = undefined;
        }
        const value = compositionType === CompositionType.Companies ? companies : employees;
        const total = i < primaryCityIndustries.length ? primaryTotal : secondaryTotal;
        barChartData.push({
          groupName,
          x: industry.name.replace(/ and /g, ' & '),
          y: value / total * 100,
          fill,
          onClick: (!isClusterView && industry.level !== DigitLevel.Six) || (isClusterView && industry.level + '' !== ClusterLevel.C3 + '')
            ? () => setHighlighted(industryId) : undefined,
        });
      }
    });
    const sortedData = orderBy(barChartData, ['groupName', 'y'], ['asc', 'desc']);
    const loadingOverlay = loading ? <LoadingBlock /> : null;

    output = (
      <VizContainer style={{height: dimensions.height}}>
        <ErrorBoundary>
          <Chart
            data={sortedData}
            compositionType={compositionType}
            height={dimensions.height}
            loading={loading}
            primaryName={primaryCityName}
            secondaryName={secondaryCityName}
          />
        </ErrorBoundary>
        {loadingOverlay}
      </VizContainer>
    );
  } else {
    output = null;
  }

  const breadCrumbList = [];
  let current = highlightIndustry;
  while (current !== undefined) {
    breadCrumbList.push(current);
    const currentParentId = current.parentId;
    current = currentParentId ? industryOrClusterMap.data[currentParentId] : undefined;
  }
  const breadCrumbs = breadCrumbList.reverse().map((industry, i) => {
    const industryName = industry.name ? industry.name.replace(' and ', ' & ') : '';
    if (i === breadCrumbList.length - 1) {
      return (
        <BreadCrumb key={industry.id}>
          {industryName}
        </BreadCrumb>
      );
    }
    return (
      <BreadCrumb key={industry.id}>
        <BreadCrumbLink onClick={() => setHighlighted((industry as any)[idField])}>
          <span>{industryName}</span>
        </BreadCrumbLink>
      </BreadCrumb>
    );
  });
  const topLevelText = isClusterView ? getString('global-ui-cluster-aggregation-level', {
    cluster: 'cluster_1',
  }) : getString('global-ui-sector-level');
  const topLevelBreadCrumb = breadCrumbList.length ? (
    <BreadCrumb>
      <BreadCrumbLink onClick={() => setHighlighted(undefined)}>
        <span>{topLevelText}</span>
      </BreadCrumbLink>
    </BreadCrumb>
  ) : (
    <BreadCrumb>
        {topLevelText}
    </BreadCrumb>
  );

  const onButtonClick = (value: Highlighted) => {
    if (value === Highlighted.relative) {
      const route = createRoute.city(CityRoutes.CityGoodAt, primaryCity + '');
      history.push(route + history.location.search);
    }
  };

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: isClusterView ? hiddenClusters : hiddenSectors,
          digitLevel: null,
          clusterLevel: null,
          setHighlighted,
          mode: isClusterView ? Mode.cluster : Mode.naics,
        }}
        settingsOptions={{
          compositionType: true,
          colorBy: true,
          aggregationMode: true,
        }}
        vizNavigation={vizNavigation}
      />
      <Root>
        <BreadCrumbList>
          {topLevelBreadCrumb}
          {breadCrumbs}
        </BreadCrumbList>
        <PrimarySecondaryLegend>
          <LegendItem>
            <LegendText>
              {primaryCityName}
            </LegendText>
            <LegendBlock style={{backgroundColor: '#666'}} />
          </LegendItem>
          <LegendItem>
            <LegendBlock style={{backgroundColor: rgba('#666', 0.4)}} />
            <LegendText>
              {secondaryCityName}
            </LegendText>
          </LegendItem>
        </PrimarySecondaryLegend>

        <BottomAxisRoot>
          <AxisLabelBase>
            <PresenceToggle
              togglePresence={true}
              highlight={Highlighted.absolute}
              showArrows={false}
              onButtonClick={onButtonClick}
            />
          </AxisLabelBase>
        </BottomAxisRoot>
        <BenchmarkRoot>
          <BenchmarkLegend
            comparisonType={ComparisonType.Absolute}
          />
        </BenchmarkRoot>
        <SizingContainer ref={rootRef}>
          {output}
        </SizingContainer>
      </Root>
    </>
  );
};

export default IndustryZoomableBarChart;