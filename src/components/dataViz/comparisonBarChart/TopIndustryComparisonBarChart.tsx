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
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import Chart, {FilteredDatum} from './Chart';
import {useComparisonQuery, SuccessResponse, RegionGroup} from './cityIndustryComparisonQuery';
import {Mode} from '../../general/searchIndustryInGraphDropdown';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
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
  primaryCity: number;
  comparison: number | RegionGroup;
  year: number;
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
}



const TopIndustryComparisonBarChart = (props: Props) => {
  const {
    primaryCity, comparison, year, digitLevel, compositionType, hiddenSectors,
    highlighted, setHighlighted, vizNavigation,
  } = props;

  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const {loading, error, data} = useComparisonQuery({primaryCity, comparison, year});
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
    const {primaryCityIndustries, secondaryCityIndustries} = dataToUse;
    let primaryTotal = 0;
    let secondaryTotal = 0;
    const filteredPrimaryData: FilteredDatum[] = [];
    primaryCityIndustries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, naicsIdTopParent} = industry;
        const colorDatum = sectorColorMap.find(s => s.id === naicsIdTopParent.toString());
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        primaryTotal = compositionType === CompositionType.Companies ? primaryTotal + companies : primaryTotal + employees;
        if (!hiddenSectors.includes(naicsIdTopParent.toString()) && colorDatum) {
          filteredPrimaryData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            naicsIdTopParent: naicsIdTopParent.toString(),
            color: colorDatum.color,
          });
        }
      }
    });
    const filteredSecondaryData: FilteredDatum[] = [];
    secondaryCityIndustries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, naicsIdTopParent} = industry;
        const colorDatum = sectorColorMap.find(s => s.id === naicsIdTopParent.toString());
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        secondaryTotal = compositionType === CompositionType.Companies ? secondaryTotal + companies : secondaryTotal + employees;
        if (!hiddenSectors.includes(naicsIdTopParent.toString()) && colorDatum) {
          filteredSecondaryData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            naicsIdTopParent: naicsIdTopParent.toString(),
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
        <VizContainer style={{height: dimensions.height}}>
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

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: hiddenSectors, digitLevel, setHighlighted, clusterLevel: null,
          mode: Mode.naics,
        }}
        settingsOptions={{compositionType: true, digitLevel: true}}
        vizNavigation={vizNavigation}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default TopIndustryComparisonBarChart;
