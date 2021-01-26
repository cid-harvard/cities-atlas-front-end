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
import {ZoomLevel} from './chart/createChart';
import {NodeSizing} from '../../../routing/routes';

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
  hovered: string | undefined;
  compositionType: CompositionType;
  setHighlighted: (value: string | undefined) => void;
  setHovered: (value: string | undefined) => void;
  setZoomLevel: (zoomLevel: ZoomLevel) => void;
  hideClusterOverlay: boolean;
  nodeSizing: NodeSizing | undefined;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {
    setHighlighted, highlighted, setZoomLevel, hideClusterOverlay,
    setHovered, hovered, nodeSizing,
  } = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const chartKey = dimensions
    ? 'industry-space-sized-to-container-key' + dimensions.width.toString() + dimensions.height.toString()
    : 'industry-space-sized-to-container-key-0-0';

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
        settingsOptions={{compositionType: false, hideClusterOverlay: true, nodeSizing: true}}
      />
      <Root ref={rootRef}>
        <IndustrySpaceContainer>
          <Chart
            key={chartKey}
            width={dimensions ? dimensions.width : 0}
            height={dimensions ? dimensions.height : 0}
            onNodeSelect={setHighlighted}
            hovered={hovered}
            onNodeHover={setHovered}
            highlighted={highlighted}
            onZoomLevelChange={setZoomLevel}
            hideClusterOverlay={hideClusterOverlay}
            nodeSizing={nodeSizing}
          />
      </IndustrySpaceContainer>
      </Root>
    </>
  );
};

export default ClusteredIndustrySpace;
