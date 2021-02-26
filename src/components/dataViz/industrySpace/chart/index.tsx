import React, {useEffect, useState, useRef, useCallback} from 'react';
import createChart, {
  ZoomLevel,
  outerRingRadius,
  innerRingRadius,
  svgRingModeClassName,
  NodeAction,
} from './createChart';
import useLayoutData from './useLayoutData';
import useRCAData, {SuccessResponse} from './useRCAData';
import styled from 'styled-components/macro';
import {
  primaryFont,
  ButtonBase,
  lightBorderColor,
  primaryColorLight,
} from '../../../../styling/styleUtils';
import LoadingBlock from '../../../transitionStateComponents/VizLoadingBlock';
import {RapidTooltipRoot} from '../../../../utilities/rapidTooltip';
import {NodeSizing, defaultNodeSizing, ColorBy} from '../../../../routing/routes';
import {DigitLevel,CompositionType} from '../../../../types/graphQL/graphQLTypes';
import useColorByIntensity from '../../treeMap/useColorByIntensity';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {defaultYear} from '../../../../Utils';

const hideClusterOverlayClassName = 'hide-industry-space-clusters-overlay-class';

const Root = styled.div`
  will-change: all;

  svg {
    &:not(.${svgRingModeClassName}) {
      cursor: grab;
    }

    /* Node hover and active styling */
    .industry-node,
    .industry-continents,
    .industry-countries {
      transition: fill 0.2s ease;
    }

    .industry-node,
    .industry-edge-node {
      &:hover,
      &.active {
        cursor: pointer;
        stroke: #333;
        stroke-width: 0.5;
      }
    }

    .industry-continents,
    .industry-countries {
      &:hover {
        cursor: pointer;
      }
    }

    /* Ring styling for when in ring mode */
    circle.outer-ring {
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      r: ${outerRingRadius}px;
      opacity: 0;
    }

    circle.inner-ring {
      r: ${innerRingRadius}px;
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      opacity: 0;
    }

    textPath.ring-label {
      font-size: 5.75px;
      font-weight: 600;
      text-transform: uppercase;
      fill: ${primaryColorLight};
      pointer-events: none;
    }

    /* Remove pointer events from multiple layers */
    .industry-countries,
    circle.outer-ring,
    circle.inner-ring,
    .industry-cluster-hovered,
    .industry-node,
    .industry-node-hovered,
    .industry-nodes-label-group,
    .industry-continents-label,
    .industry-countries-label-group {
      pointer-events: none;
      will-change: transform, fill, opacity;
      transition: fill 1s ease;
    }

    /* Label styling */
    .industry-continents-label,
    .industry-countries-label,
    .industry-nodes-label,
    .industry-ring-label {
      fill: #444;
      paint-order: stroke;
      text-anchor: middle;
      font-family: ${primaryFont};
      will-change: transform, fill, opacity;
    }

    .industry-continents-label {
      stroke: #efefef;
      stroke-width: 2.5px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .industry-countries-label {
      stroke: #efefef;
      stroke-width: 1px;
      font-weight: 600;
    }

    .industry-nodes-label {
      stroke: #fff;
      stroke-width: 0.1px;
    }

    .industry-ring-label {
      stroke: #fff;
      stroke-width: 0.6px;
    }
  }

  &.${hideClusterOverlayClassName} {
    svg {
      .industry-continents,
      .industry-countries,
      .industry-continents-label,
      .industry-countries-label {
        display: none !important;
      }
    }
    svg:not(.${svgRingModeClassName}) {
      circle.industry-edge-node {
        display: block !important;
        opacity: 1 !important;
        pointer-events: all !important;
        fill: var(--true-fill-color) !important;
      }
    }
  }
`;

const BackButtonContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  display: flex;
  justify-content: center;
`;
const BackButton = styled(ButtonBase)`
  display: none;
  pointer-events: all;
  transform: translate(0, calc(-100% - 0.25rem));
`;

const ZoomButtonsContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ZoomButton = styled(ButtonBase)`
  pointer-events: all;
  border: solid 1px ${lightBorderColor};
  background-color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  margin-bottom: 0.45rem;
`;

type Chart = {
  initialized: false;
} | {
  initialized: true;
  render: () => void;
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setHighlightedPoint: (naicsId: string | undefined, action: NodeAction) => void;
  setExternalHoveredId: (naicsId: string | undefined) => void;
  update: (data: SuccessResponse, colorBy: ColorBy) => void;
  updateNodeSize: (nodeSizing: NodeSizing) => void;
  updateNodeColor: (colorBy: ColorBy) => void;
};

interface Props {
  width: number;
  height: number;
  highlighted: string | undefined;
  hovered: string | undefined;
  onNodeSelect: (naicsId: string | undefined, action: NodeAction) => void;
  onNodeHover: (naicsId: string | undefined) => void;
  onZoomLevelChange: (zoomLevel: ZoomLevel) => void;
  hideClusterOverlay: boolean;
  nodeSizing: NodeSizing | undefined;
  colorBy: ColorBy;
}

const Chart = (props: Props) => {
  const {
    width, height, onNodeSelect, highlighted, onZoomLevelChange, hideClusterOverlay,
    onNodeHover, hovered, nodeSizing, colorBy,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});

  const layout = useLayoutData();
  const {loading, data} = useRCAData(DigitLevel.Six);
  const intensity = useColorByIntensity({
    digitLevel: DigitLevel.Six,
    colorBy,
    compositionType: CompositionType.Companies,
  });
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: DigitLevel.Six, year: defaultYear});

  useEffect(() => {
    const chartNode = chartRef.current;
    const backButtonNode = backButtonRef.current;
    const tooltipNode = tooltipRef.current;
    if (chartNode) {
      if (chartNode && layout.data && backButtonNode && tooltipNode && (
          (chart.initialized === false && width && height)
      )) {
        chartNode.innerHTML = '';
        setChart({...createChart({
          rootEl: chartNode,
          data: layout.data,
          rootWidth: width,
          rootHeight: height,
          backButton: backButtonNode,
          tooltipEl: tooltipNode,
          onNodeSelect, onZoomLevelChange,
          onNodeHover,
        }), initialized: true });
      }
    }
  }, [chartRef, chart, width, height, layout, onNodeSelect, onZoomLevelChange, onNodeHover]);

  useEffect(() => {
    if (chart.initialized) {
      const action = highlighted === undefined ? NodeAction.SoftReset : NodeAction.SelectNode;
      chart.setHighlightedPoint(highlighted, action);
    }
  }, [chart, highlighted]);

  useEffect(() => {
    if (chart.initialized) {
      chart.setExternalHoveredId(hovered);
    }
  }, [chart, hovered]);

  useEffect(() => {
    if (chart.initialized && data !== undefined) {
      chart.update(data, colorBy);
    }
  }, [chart, data, colorBy]);

  useEffect(() => {
    if (chart.initialized) {
      chart.updateNodeSize(nodeSizing ? nodeSizing : defaultNodeSizing);
    }
  }, [chart, nodeSizing]);

  useEffect(() => {
    if (chart.initialized && colorBy !== ColorBy.sector && colorBy !== ColorBy.intensity) {
      chart.updateNodeColor(colorBy);
    }
  }, [chart, colorBy, aggregateIndustryDataMap, intensity]);

  const resetZoom = useCallback(() => {
    if (chart.initialized) {
      chart.reset();
    }
  }, [chart]);

  const zoomIn = useCallback(() => {
    if (chart.initialized) {
      chart.zoomIn();
    }
  }, [chart]);

  const zoomOut = useCallback(() => {
    if (chart.initialized) {
      chart.zoomOut();
    }
  }, [chart]);

  const loadingOverlay = loading || (!chart.initialized && width && height)
    ? <LoadingBlock /> : null;

  return (
    <>
      <Root
        ref={chartRef}
        style={{width, height}}
        className={hideClusterOverlay ? hideClusterOverlayClassName : undefined}
      />
      <BackButtonContainer>
        <BackButton ref={backButtonRef}>{'< Back to Industry Space'}</BackButton>
      </BackButtonContainer>
      <RapidTooltipRoot ref={tooltipRef} />
      <ZoomButtonsContainer>
        <ZoomButton onClick={zoomIn}>
          + Zoom In
        </ZoomButton>
        <ZoomButton onClick={zoomOut}>
          - Zoom Out
        </ZoomButton>
        <ZoomButton onClick={resetZoom}>
          Reset Zoom
        </ZoomButton>
      </ZoomButtonsContainer>
      {loadingOverlay}
    </>
  );
};

export default Chart;
