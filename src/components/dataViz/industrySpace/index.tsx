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
import {NodeSizing, ColorBy, ClusterMode} from '../../../routing/routes';
import useFluent from '../../../hooks/useFluent';
import {Mode} from '../../general/searchIndustryInGraphDropdown';

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
  zoomLevel: ZoomLevel;
  clusterOverlayMode: ClusterMode;
  nodeSizing: NodeSizing | undefined;
  colorBy: ColorBy;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {
    setHighlighted, highlighted, setZoomLevel, clusterOverlayMode,
    setHovered, hovered, nodeSizing, preChartRowKey, onNodeSelect,
    colorBy, zoomLevel,
  } = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const chartKey = dimensions
    ? 'industry-space-sized-to-container-key' + dimensions.width.toString() + dimensions.height.toString()
    : 'industry-space-sized-to-container-key-0-0';
  const getString = useFluent();

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
        searchInGraphOptions={{
          hiddenParents: [], digitLevel: DigitLevel.Six, clusterLevel: null, setHighlighted,
          mode: Mode.naics,
        }}
        settingsOptions={{compositionType: {
          disabledOptions: [CompositionType.Employees],
        }, clusterOverlayMode: true, nodeSizing: true, colorBy: {nodes: true},
        digitLevel: {
          sixDigitOnlyMessage: getString('glossary-digit-level-disabled-industry-space'),
        },
      }}
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
            clusterOverlayMode={clusterOverlayMode}
            nodeSizing={nodeSizing}
            colorBy={colorBy}
            zoomLevel={zoomLevel}
          />
      </IndustrySpaceContainer>
      </Root>
    </>
  );
};

export default ClusteredIndustrySpace;
