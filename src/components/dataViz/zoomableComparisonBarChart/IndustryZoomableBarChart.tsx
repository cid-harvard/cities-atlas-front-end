import React, {useEffect, useState, useRef} from 'react';
import {
  // CityIndustryYear,
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
import DataViz, {
  VizType,
  ClusterBarChartDatum,
} from 'react-fast-charts';
import {
  useEconomicCompositionComparisonQuery,
  SuccessResponse,
} from '../comparisonBarChart/TopIndustryComparisonBarChart';
import orderBy from 'lodash/orderBy';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 2.5rem 1fr 1rem;

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
`;

const BreadCrumbList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
`;

const BreadCrumb = styled.li`
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 20%;
`;

const BreadCrumbLink = styled.button`
  border: none;
  background-color: transparent;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: ${secondaryFont};
  color: rgb(78, 140, 141);
  cursor: pointer;
  text-align: left;
  margin-right: 1rem;
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
  }
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
    } =dataToUse;
    const highlightedParent = highlightIndustry && highlightIndustry.level === DigitLevel.Six
      ? highlightIndustry.parentId : highlighted;
    const barChartData: ClusterBarChartDatum[] = [];
    [...primaryCityIndustries, ...secondaryCityIndustries].forEach(({naicsId, numCompany, numEmploy}, i) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.name && industry.parentId === highlightedParent) {
        const groupName = i < primaryCityIndustries.length ? 'A' : 'B';
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        const colorDatum = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
        barChartData.push({
          groupName,
          x: industry.name,
          y: compositionType === CompositionType.Companies ? companies : employees,
          fill: colorDatum ? colorDatum.color : undefined,
          onClick: industry.level !== DigitLevel.Six
            ? () => setHighlighted(naicsId) : undefined,
        })
      }
    })
    const sortedData = orderBy(barChartData, ['groupName', 'y'], ['asc', 'desc']);
    const loadingOverlay = loading ? <LoadingBlock /> : null;

    output = (
      <VizContainer style={{height: dimensions.height}}>
        <ErrorBoundary>
          <DataViz
            id={'example-cluster-bar-chart'}
            vizType={VizType.ClusterBarChart}
            data={sortedData}
            axisLabels={{left: '% of Total Firms'}}
            height={dimensions.height}
            animateBars={loading ? undefined : 250}
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
    if (i === breadCrumbList.length - 1) {
      return (
        <BreadCrumb key={industry.naicsId}>
          {industry.name}
        </BreadCrumb>
      );
    }
    return (
      <BreadCrumb key={industry.naicsId}>
        <BreadCrumbLink onClick={() => setHighlighted(industry.naicsId)}>
          <span>{industry.name}</span>
        </BreadCrumbLink>
      </BreadCrumb>
    );
  })
  const topLevelBreadCrumb = breadCrumbList.length ? (
    <BreadCrumb>
      <BreadCrumbLink onClick={() => setHighlighted(undefined)}>
        <span>Sector Level</span>
      </BreadCrumbLink>
    </BreadCrumb>
  ) : (
    <BreadCrumb>
        Sector Level
    </BreadCrumb>
  )

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
      </Root>
    </>
  );
};

export default IndustryZoomableBarChart;