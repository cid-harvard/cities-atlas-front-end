import React, {useEffect, useState, useRef} from 'react';
import {usePrevious} from 'react-use';
import createChart from './createChart';
import useLayoutData from './useLayoutData';
import styled from 'styled-components/macro';
import {
  outerRingRadius,
  innerRingRadius,
} from './createChart';
import {
  primaryFont,
  ButtonBase,
} from '../../../../styling/styleUtils';
import LoadingBlock from '../../../transitionStateComponents/VizLoadingBlock';
import {RapidTooltipRoot} from '../../../../utilities/rapidTooltip';

const Root = styled.div`
  will-change: all;

  svg {
    cursor: grab;

    /* Node hover and active styling */
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
      text-transform: uppercase;
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
`;

const BackButtonContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  text-align: center;
  display: flex;
  justify-content: center;
`;
const BackButton = styled(ButtonBase)`
  display: none;
  pointer-events: all;
  transform: translate(0, calc(-100% - 0.25rem));
`;

type Chart = {
  initialized: false;
} | {
  initialized: true;
  update: () => void;
};

interface Props {
  width: number;
  height: number;
}

const Chart = (props: Props) => {
  const {
    width, height,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});
  const prevWidth = usePrevious(width);
  const prevHeight = usePrevious(height);

  const layout = useLayoutData();

  useEffect(() => {
    const chartNode = chartRef.current;
    const backButtonNode = backButtonRef.current;
    const tooltipNode = tooltipRef.current;
    if (chartNode) {
      if (chartNode && layout.data && backButtonNode && tooltipNode && (
          (chart.initialized === false && width && height) ||
          (chart.initialized === true && width !== prevWidth && height !== prevHeight)
      )) {
        chartNode.innerHTML = '';
        const {update} = createChart({
          rootEl: chartNode,
          data: layout.data,
          rootWidth: width,
          rootHeight: height,
          backButton: backButtonNode,
          tooltipEl: tooltipNode,
        });
        setChart({initialized: true, update});
      }
    }
  }, [chartRef, chart, width, height, prevWidth, prevHeight, layout]);

  const loadingOverlay = !chart.initialized && width && height ? <LoadingBlock /> : null;

  return (
    <>
      <Root
        ref={chartRef}
        style={{width, height}}
      />
      <BackButtonContainer>
        <BackButton ref={backButtonRef}>{'< Back to Industry Space'}</BackButton>
      </BackButtonContainer>
      <RapidTooltipRoot ref={tooltipRef} />
      {loadingOverlay}
    </>
  );
};

export default React.memo(Chart);
