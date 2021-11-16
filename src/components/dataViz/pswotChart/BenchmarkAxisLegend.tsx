import React, {useLayoutEffect, useRef} from 'react';
import styled from 'styled-components';
import { useWindowWidth } from '../../../contextProviders/appContext';
import useFluent from '../../../hooks/useFluent';
import { baseColor } from '../../../styling/styleUtils';
import BenchmarkLegend from '../legend/BenchmarkLegend';
import PresenceToggle from '../legend/PresenceToggle';

const Root = styled.div`
  position: fixed;
  z-index: 100;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  left: -1000px;

  @media (max-width: 943px) {
    position: static;
    margin-top: -2rem;
    margin-left: 120px;
    transform: none;
  }
`;

const BottomAxisRoot = styled.div`
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding-left: 0;
`;

const BenchmarkRoot = styled(BottomAxisRoot)`
  grid-row: 3;
  justify-content: center;
  white-space: normal;
`;

const AxisLabelBase = styled.div`
  font-weight: 600;
  font-size: 0.75rem;
  color: ${baseColor};
  text-transform: uppercase;

  @media (max-width: 1000px) {
    font-size: 0.6rem;
  }

  @media (max-height: 600px) {
    font-size: 0.65rem;
  }
`;

const AxisLabelLeft = styled(AxisLabelBase)`
  margin-right: 1rem;
  font-weight: 400;

  @media (max-width: 990px) {
    margin-right: 0.75rem;
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

const AxisLabelRight = styled(AxisLabelBase)`
  margin-left: 1rem;
  font-weight: 400;

  @media (max-width: 990px) {
    margin-left: 0.75rem;
  }

  @media (max-width: 920px) {
    display: none;
  }
`;

const BenchmarkAxisLegend = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  useLayoutEffect(() => {
    setTimeout(() => {
      const bottomLabelNode: SVGTSpanElement | null = document.querySelector('.pswot-plot-bottom-label');
      const rootNode = rootRef.current;
      if (bottomLabelNode && rootNode) {
        const { top, left } = bottomLabelNode.getBoundingClientRect();
        bottomLabelNode.style.opacity = '0';
        rootNode.style.left = left + 'px';
        rootNode.style.top = top + 'px';
        if (window.innerWidth <= 943) {
          rootNode.style.right = '0px';
        }
      }
    }, 0);
  }, [rootRef, windowDimensions]);

  return (
    <Root ref={rootRef}>
      <BottomAxisRoot>
        <AxisLabelLeft>{getString('pswot-axis-labels-bottom-left')}</AxisLabelLeft>
        <AxisLabelBase>
          <PresenceToggle
            showArrows={true}
          />
        </AxisLabelBase>
        <AxisLabelRight>{getString('pswot-axis-labels-bottom-right')}</AxisLabelRight>
      </BottomAxisRoot>
      <BenchmarkRoot>
        <BenchmarkLegend />
      </BenchmarkRoot>
    </Root>
  );
};

export default BenchmarkAxisLegend;
