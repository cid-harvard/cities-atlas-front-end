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
import {ZoomLevel, NodeAction} from './chart/createChart';
import {NodeSizing, ColorBy} from '../../../routing/routes';

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
  preChartRowKey: string;
  hovered: string | undefined;
  compositionType: CompositionType;
  setHighlighted: (value: string | undefined) => void;
  onNodeSelect: (value: string | undefined, action: NodeAction) => void;
  setHovered: (value: string | undefined) => void;
  setZoomLevel: (zoomLevel: ZoomLevel) => void;
  hideClusterOverlay: boolean;
  nodeSizing: NodeSizing | undefined;
  colorBy: ColorBy;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {
    setHighlighted, highlighted, setZoomLevel, hideClusterOverlay,
    setHovered, hovered, nodeSizing, preChartRowKey, onNodeSelect,
    colorBy,
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
        key={preChartRowKey}
        searchInGraphOptions={{hiddenSectors: [], digitLevel: DigitLevel.Six, setHighlighted}}
        settingsOptions={{compositionType: false, hideClusterOverlay: true, nodeSizing: true, colorBy: true}}
      />
      <Root ref={rootRef}>
        <IndustrySpaceContainer>
          <Chart
            key={chartKey}
            width={dimensions ? dimensions.width : 0}
            height={dimensions ? dimensions.height : 0}
            onNodeSelect={onNodeSelect}
            hovered={hovered}
            onNodeHover={setHovered}
            highlighted={highlighted}
            onZoomLevelChange={setZoomLevel}
            hideClusterOverlay={hideClusterOverlay}
            nodeSizing={nodeSizing}
            colorBy={colorBy}
          />
      </IndustrySpaceContainer>
      </Root>
    </>
  );
};

export default ClusteredIndustrySpace;
