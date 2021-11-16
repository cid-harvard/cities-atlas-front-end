import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
  CompositionType,
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
  clusterColorMap,
  sectorColorMap,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import Chart, {FilteredDatum} from './Chart';
import {useComparisonQuery, SuccessResponse, RegionGroup} from './cityIndustryComparisonQuery';
import {Mode} from '../../general/searchIndustryInGraphDropdown';
import {
  BottomAxisRoot,
  BenchmarkRoot,
  AxisLabelLeft,
  AxisLabelRight,
  AxisLabelBase,
} from '../verticalBarChart/RCABarChart';
import PresenceToggle, { Highlighted } from '../legend/PresenceToggle';
import { ComparisonType } from '../../navigation/secondaryHeader/comparisons/AddComparisonModal';
import BenchmarkLegend from '../legend/BenchmarkLegend';
import { AggregationMode, CityRoutes, ClusterLevel } from '../../../routing/routes';
import { createRoute } from '../../../routing/Utils';
import { useHistory } from 'react-router-dom';
import useFluent from '../../../hooks/useFluent';
import { useGlobalClusterMap } from '../../../hooks/useGlobalClusterData';

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

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
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
      font-weight: 600;
    }
  }
`;

interface Props {
  primaryCity: number;
  comparison: number | RegionGroup | PeerGroup;
  year: number;
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
  clusterLevel: ClusterLevel;
  isClusterView: boolean;
  hiddenClusters: ClassificationNaicsCluster['id'][];
}

const TopIndustryComparisonBarChart = (props: Props) => {
  const {
    primaryCity, comparison, year, digitLevel, compositionType, hiddenSectors,
    highlighted, setHighlighted, vizNavigation, clusterLevel, isClusterView,
    hiddenClusters,
  } = props;


  const industryMap = useGlobalIndustryMap();
  const clusterMap = useGlobalClusterMap();
  const industryOrClusterMap = isClusterView ? clusterMap : industryMap;
  const parentField = isClusterView ? 'clusterIdTopParent' : 'naicsIdTopParent';
  const colorMap = isClusterView ? clusterColorMap : sectorColorMap;
  const level = isClusterView ? clusterLevel : digitLevel;
  const hiddenIndustriesOrClusters = isClusterView ? hiddenClusters : hiddenSectors;
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  const history = useHistory();
  const {loading, error, data} = useComparisonQuery({
    primaryCity,
    comparison,
    year,
    aggregation: isClusterView ? AggregationMode.cluster : AggregationMode.industries,
  });
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
  if (industryOrClusterMap.loading || !dimensions || (loading && prevData === undefined)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  }  else if (industryOrClusterMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {primaryCityIndustries, secondaryCityIndustries} = dataToUse;
    let primaryTotal = 0;
    let secondaryTotal = 0;
    const filteredPrimaryData: FilteredDatum[] = [];
    primaryCityIndustries.forEach(({ industryId, numCompany, numEmploy}) => {
      const industry = industryOrClusterMap.data[industryId];
      if (industry && (industry.level + '') === (level + '')) {
        const {name} = industry;
        const topParent = (industry as any)[parentField];
        const colorDatum = colorMap.find(s => s.id === topParent.toString());
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        primaryTotal = compositionType === CompositionType.Companies ? primaryTotal + companies : primaryTotal + employees;
        if (!hiddenIndustriesOrClusters.includes(topParent.toString()) && colorDatum) {
          filteredPrimaryData.push({
            id: industryId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topParent: topParent.toString(),
            color: colorDatum.color,
          });
        }
      }
    });
    const filteredSecondaryData: FilteredDatum[] = [];
    secondaryCityIndustries.forEach(({ industryId, numCompany, numEmploy}) => {
      const industry = industryOrClusterMap.data[industryId];
      if (industry && (industry.level + '') === (level + '')) {
        const {name} = industry;
        const topParent = (industry as any)[parentField];
        const colorDatum = colorMap.find(s => s.id === topParent.toString());
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        secondaryTotal = compositionType === CompositionType.Companies ? secondaryTotal + companies : secondaryTotal + employees;
        if (!hiddenIndustriesOrClusters.includes(topParent.toString()) && colorDatum) {
          filteredSecondaryData.push({
            id: industryId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topParent: topParent.toString(),
            color: colorDatum.color,
          });
        }
      }
    });
    if (!filteredPrimaryData.length && !filteredSecondaryData.length) {
      output = (
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-no-sectors-selected'} />
        </LoadingOverlay>
      );
    } else {
      const loadingOverlay = loading ? <LoadingBlock /> : null;
      output = (
        <VizContainer>
            <ErrorBoundary>
              <Chart
                key={dimensions.height.toString() + dimensions.width.toString()}
                filteredPrimaryData={filteredPrimaryData}
                filteredSecondaryData={filteredSecondaryData}
                primaryTotal={primaryTotal}
                secondaryTotal={secondaryTotal}
                primaryCityId={primaryCity}
                secondaryCityId={comparison}
                highlighted={highlighted}
                compositionType={compositionType}
              />
            </ErrorBoundary>
          {loadingOverlay}
        </VizContainer>
      );
    }
  } else {
    output = null;
  }

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
        vizNavigation={vizNavigation}
      />
      <Root ref={rootRef}>
        <BottomAxisRoot>
          <AxisLabelLeft>{getString('pswot-axis-labels-bottom-left')}</AxisLabelLeft>
          <AxisLabelBase>
            <PresenceToggle
              togglePresence={true}
              highlight={Highlighted.absolute}
              showArrows={true}
              onButtonClick={onButtonClick}
            />
          </AxisLabelBase>
          <AxisLabelRight>{getString('pswot-axis-labels-bottom-right')}</AxisLabelRight>
        </BottomAxisRoot>
        <BenchmarkRoot>
          <BenchmarkLegend
            comparisonType={ComparisonType.Absolute}
          />
        </BenchmarkRoot>
        <VizRoot>
          {output}
        </VizRoot>
      </Root>
    </>
  );
};

export default TopIndustryComparisonBarChart;
