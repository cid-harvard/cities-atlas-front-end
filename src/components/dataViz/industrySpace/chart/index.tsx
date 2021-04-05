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
  primaryColor,
  secondaryFont,
} from '../../../../styling/styleUtils';
import LoadingBlock from '../../../transitionStateComponents/VizLoadingBlock';
import {RapidTooltipRoot} from '../../../../utilities/rapidTooltip';
import {NodeSizing, defaultNodeSizing, ColorBy, ClusterMode} from '../../../../routing/routes';
import {DigitLevel} from '../../../../types/graphQL/graphQLTypes';
import useColorByIntensity from '../../treeMap/useColorByIntensity';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {defaultYear} from '../../../../Utils';

const clusterOverlayClassNames = {
  [ClusterMode.outline]: 'industry-space-clusters-outlines-class',
  [ClusterMode.overlay]: undefined,
  [ClusterMode.none]: 'hide-industry-space-clusters-overlay-class',
};

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
    .industry-continents-value-label,
    .industry-countries-label-group {
      pointer-events: none;
      will-change: transform, fill, opacity;
      transition: fill 1s ease;
    }

    /* Label styling */
    .industry-continents-label,
    .industry-continents-value-label,
    .industry-countries-label,
    .industry-nodes-label,
    .industry-ring-label {
      fill: #444;
      paint-order: stroke;
      text-anchor: middle;
      font-family: ${primaryFont};
      will-change: transform, fill, opacity;
    }

    .industry-continents-label,
    .industry-continents-value-label {
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

  &.${clusterOverlayClassNames[ClusterMode.none]} {
    svg {
      .industry-continents,
      .industry-countries,
      .industry-continents-label,
      .industry-continents-value-label,
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

const BreadCrumbContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 950px) {
    justify-content: flex-end;
  }
`;

const BreadCrumb = styled.button`
  transform: translate(0, calc(-100% - 0.25rem));
  pointer-events: all;
  max-width: min-content;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: clamp(0.6rem, 0.7vw, 0.875rem);
  background-color: transparent;
`;

const Arrow = styled.span`
  font-size: 1.25rem;
  padding-left: 0.6rem;

  @media (max-width: 950px) {
    font-size: 0.9rem;
  }
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
  zoomLevel: ZoomLevel;
  clusterOverlayMode: ClusterMode;
  nodeSizing: NodeSizing | undefined;
  colorBy: ColorBy;
}

const Chart = (props: Props) => {
  const {
    width, height, onNodeSelect, highlighted, onZoomLevelChange, clusterOverlayMode,
    onNodeHover, hovered, nodeSizing, colorBy, zoomLevel,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  const breadCrumbCluster1Ref = useRef<HTMLButtonElement | null>(null);
  const breadCrumbCluster2Ref = useRef<HTMLButtonElement | null>(null);
  const breadCrumbNodeRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});

  const layout = useLayoutData();
  const {loading, data} = useRCAData(DigitLevel.Six);
  const intensity = useColorByIntensity({
    digitLevel: DigitLevel.Six,
    colorBy,
  });
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: DigitLevel.Six, year: defaultYear});

  useEffect(() => {
    const chartNode = chartRef.current;
    const tooltipNode = tooltipRef.current;
    const breadCrumbCluster1Button = breadCrumbCluster1Ref.current;
    const breadCrumbCluster2Button = breadCrumbCluster2Ref.current;
    const breadCrumbNodeButton = breadCrumbNodeRef.current;
    if (chartNode) {
      if (chartNode && layout.data && tooltipNode &&
          breadCrumbCluster1Button && breadCrumbCluster2Button && breadCrumbNodeButton && (
          (chart.initialized === false && width && height)
      )) {
        chartNode.innerHTML = '';
        setChart({...createChart({
          rootEl: chartNode,
          data: layout.data,
          rootWidth: width,
          rootHeight: height,
          tooltipEl: tooltipNode,
          onNodeSelect, onZoomLevelChange,
          onNodeHover,
          breadCrumbCluster1Button,
          breadCrumbCluster2Button,
          breadCrumbNodeButton,
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
        className={clusterOverlayClassNames[clusterOverlayMode]}
      />
      <BreadCrumbContainer>
        <BreadCrumb
          ref={breadCrumbCluster1Ref}
        >
          <span
            style={zoomLevel === ZoomLevel.Cluster1 ?
              {color: primaryColor, fontWeight: 600}
              : undefined}
          >
            Level 1
            Knowledge&nbsp;Clusters
          </span>
          <Arrow>{'→'}</Arrow>
        </BreadCrumb>
        <BreadCrumb
          ref={breadCrumbCluster2Ref}
        >
          <span
            style={zoomLevel === ZoomLevel.Cluster2 ?
              {color: primaryColor, fontWeight: 600}
              : undefined}
          >
            Level 2
            Knowledge&nbsp;Clusters
          </span>
          <Arrow>{'→'}</Arrow>
        </BreadCrumb>
        <BreadCrumb
          ref={breadCrumbNodeRef}
        >
          <span
            style={zoomLevel === ZoomLevel.Node ?
              {color: primaryColor, fontWeight: 600}
              : undefined}
          >
            Industry&nbsp;Nodes
          </span>
        </BreadCrumb>
      </BreadCrumbContainer>
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
