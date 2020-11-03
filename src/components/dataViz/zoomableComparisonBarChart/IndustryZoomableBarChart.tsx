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
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import {
  sectorColorMap,
  secondaryFont,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import {
  ClusterBarChartDatum,
} from 'react-fast-charts';
import {
  useEconomicCompositionComparisonQuery,
  SuccessResponse,
} from '../comparisonBarChart/TopIndustryComparisonBarChart';
import orderBy from 'lodash/orderBy';
import {rgba} from 'polished';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';
import useFluent from '../../../hooks/useFluent';
import Chart from './Chart';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 4rem 1fr 2rem;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const SizingContainer = styled.div`
  width: 100%;
  height: 100%;
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
  secondaryCity: number;
  year: number;
  highlighted: number | null;
  setHighlighted: (value: string | undefined) => void;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
}

const IndustryZoomableBarChart = (props: Props) => {
  const {
    primaryCity, secondaryCity, year, compositionType, highlighted,
    hiddenSectors, setHighlighted, vizNavigation,
  } = props;

  const {loading, error, data} = useEconomicCompositionComparisonQuery({
    primaryCity, secondaryCity, year,
  });
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const getString = useFluent();
  const {data: globalData} = useGlobalLocationData();

  const primaryCityDatum = globalData
    ? globalData.cities.find(c => parseInt(c.cityId, 10) === primaryCity) : undefined;
  const primaryCityName = primaryCityDatum && primaryCityDatum.name? primaryCityDatum.name : '';

  const secondaryCityDatum = globalData
    ? globalData.cities.find(c => parseInt(c.cityId, 10) === secondaryCity) : undefined;
  const secondaryCityName = secondaryCityDatum && secondaryCityDatum.name ? secondaryCityDatum.name : '';

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);

  const highlightIndustry = highlighted ? industryMap.data[highlighted] : undefined;

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
    const {
      primaryCityIndustries, secondaryCityIndustries,
    } = dataToUse;
    const highlightedParent = highlightIndustry && highlightIndustry.level === DigitLevel.Six
      ? highlightIndustry.parentId : highlighted;
    const primaryTotal = primaryCityIndustries.reduce((total, {naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.parentId === null) {
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const increment = compositionType === CompositionType.Companies ? companies : employees;
        return total + increment;
      } else {
        return total;
      }
    }, 0);
    const secondaryTotal = secondaryCityIndustries.reduce((total, {naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
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
    [...primaryCityIndustries, ...secondaryCityIndustries].forEach(({naicsId, numCompany, numEmploy}, i) => {
      const industry = industryMap.data[naicsId];
      if (
          industry && industry.name && industry.parentId === highlightedParent &&
          !hiddenSectors.includes(industry.naicsIdTopParent.toString())
        ) {
        const groupName = i < primaryCityIndustries.length ? 'A' : 'B';
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const colorDatum = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
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
          x: industry.name,
          y: value / total * 100,
          fill,
          onClick: industry.level !== DigitLevel.Six
            ? () => setHighlighted(naicsId) : undefined,
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
    current = currentParentId ? industryMap.data[currentParentId] : undefined;
  }
  const breadCrumbs = breadCrumbList.reverse().map((industry, i) => {
    const industryName = industry.name ? industry.name.replace(' and ', ' & ') : '';
    if (i === breadCrumbList.length - 1) {
      return (
        <BreadCrumb key={industry.naicsId}>
          {industryName}
        </BreadCrumb>
      );
    }
    return (
      <BreadCrumb key={industry.naicsId}>
        <BreadCrumbLink onClick={() => setHighlighted(industry.naicsId)}>
          <span>{industryName}</span>
        </BreadCrumbLink>
      </BreadCrumb>
    );
  });
  const topLevelBreadCrumb = breadCrumbList.length ? (
    <BreadCrumb>
      <BreadCrumbLink onClick={() => setHighlighted(undefined)}>
        <span>{getString('global-ui-sector-level')}</span>
      </BreadCrumbLink>
    </BreadCrumb>
  ) : (
    <BreadCrumb>
        {getString('global-ui-sector-level')}
    </BreadCrumb>
  );

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenSectors,
          digitLevel: null,
          setHighlighted,
        }}
        settingsOptions={{compositionType: true, digitLevel: false}}
        vizNavigation={vizNavigation}
      />
      <Root>
        <BreadCrumbList>
          {topLevelBreadCrumb}
          {breadCrumbs}
        </BreadCrumbList>
        <SizingContainer ref={rootRef}>
          {output}
        </SizingContainer>
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
      </Root>
    </>
  );
};

export default IndustryZoomableBarChart;