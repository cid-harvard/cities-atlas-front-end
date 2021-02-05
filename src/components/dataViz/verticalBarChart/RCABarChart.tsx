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
import PreChartRow from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import useRCAData, {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  Switch,
  Route,
} from 'react-router-dom';
import {
  CityRoutes,
} from '../../../routing/routes';
import Industries from './Industries';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
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
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
}

const TopIndustryComparisonBarChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted,
    highlighted, compositionType,
  } = props;

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
    const industryData = dataToUse.nodeRca;
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    output = (
      <VizContainer style={{height: dimensions.height}}>
          <ErrorBoundary>
            <Switch>
              <Route path={CityRoutes.CityGoodAtClusters}
                render={() => (
                  <div>Skill Clusters</div>
                )}
              />
              <Route path={CityRoutes.CityGoodAt}
                render={() => (
                  <Industries
                    data={industryData}
                    highlighted={highlighted}
                    compositionType={compositionType}
                  />
                )}
              />
            </Switch>
          </ErrorBoundary>
        {loadingOverlay}
      </VizContainer>
    );
  } else {
    output = null;
  }

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{hiddenSectors, digitLevel: DigitLevel.Six, setHighlighted}}
        settingsOptions={{compositionType: true}}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default TopIndustryComparisonBarChart;