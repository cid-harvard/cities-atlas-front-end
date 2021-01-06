import React, {useRef, useEffect, useState} from 'react';
import {
  DigitLevel,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import PreChartRow from '../../../components/general/PreChartRow';
import Chart from './chart';

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

interface Props {
  cityId: number;
  year: number;
  highlighted: string | undefined;
  compositionType: CompositionType;
  setHighlighted: (value: string | undefined) => void;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {
    setHighlighted,
  } = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
      }, 0);
    }
  }, [rootRef, windowDimensions]);

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{hiddenSectors: [], digitLevel: DigitLevel.Six, setHighlighted}}
        settingsOptions={{compositionType: false, hideClusterOverlay: true}}
      />
      <Root ref={rootRef}>
        <IndustrySpaceContainer>
          <Chart
            width={dimensions ? dimensions.width : 0}
            height={dimensions ? dimensions.height : 0}
          />
      </IndustrySpaceContainer>
      </Root>
    </>
  );
};

export default React.memo(ClusteredIndustrySpace);
