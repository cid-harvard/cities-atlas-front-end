import React, {useRef, useEffect, useState} from 'react';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import useFakeData from '../../../hooks/useFakeData';
import {
  DigitLevel,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {usePrevious} from 'react-use';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import SimpleError from '../../../components/transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import ErrorBoundary from '../ErrorBoundary';
import {breakPoints} from '../../../styling/GlobalGrid';
import PreChartRow from '../../../components/general/PreChartRow';

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

const IndustrySpaceContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

interface Variables {
  cityId: number;
  year: number;
}

export const useRcaClustersQuery = (variables: Variables) => useFakeData(variables);

interface Props {
  cityId: number;
  year: number;
  highlighted: string | undefined;
  compositionType: CompositionType;
  setHighlighted: (value: string | undefined) => void;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {
    cityId, year, setHighlighted,
  } = props;
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useRcaClustersQuery({cityId, year});

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
      }, 0);
    }
  }, [rootRef, windowDimensions]);


  const prevData = usePrevious(data);
  let dataToUse: Variables | undefined;
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
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    output = (
      <IndustrySpaceContainer>
        <ErrorBoundary>
          <div>Industry Space for {cityId}</div>
        </ErrorBoundary>
        {loadingOverlay}
      </IndustrySpaceContainer>
    );
  } else {
    output = null;
  }

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{hiddenSectors: [], digitLevel: DigitLevel.Six, setHighlighted}}
        settingsOptions={{compositionType: false, hideClusterOverlay: true}}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default React.memo(ClusteredIndustrySpace);
