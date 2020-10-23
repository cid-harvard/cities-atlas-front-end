import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { lightBorderColor, baseColor } from '../../styling/styleUtils';
import { overlayPortalContainerId } from '../standardModal';
import raw from 'raw.macro';

const infoCircleSVG =  raw('../../assets/icons/info-circle.svg');

//#region Styling
const Root = styled.span`
  cursor: help;
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10000px;
  margin: 0 0.4rem;
`;

const MoreInformationI = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  line-height: 0;

  svg {
    width: 100%;
    height: 100%;

    circle {
      fill: ${baseColor};
    }

    path {
      fill: #fff;
    }
  }
`;

const TooltipBase = styled.div`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: ${baseColor};
  background-color: #fff;
  border: 1px solid ${lightBorderColor};
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
`;

const ArrowContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
  position: absolute;
  transform: translate(0, 100%);
`;

const Arrow = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  position: relative;
  display: flex;
  justify-content: center;
  transform: translate(-150%, 0);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid #dfdfdf;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 1px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #fff;
  }
`;

const GenericSpan = styled.span`
  cursor: help;
`;
//#endregion

interface Props {
  explanation: React.ReactNode;
  children?: React.ReactNode;
  cursor?: string;
}

const Tooltip = (props: Props) => {
  const {explanation, children, cursor} = props;
  const rootEl = useRef<HTMLDivElement | null>(null);
  const tooltipEl = useRef<HTMLDivElement | null>(null);
  const overlayPortalContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isTooltipShown, setIsTooltipShown] = useState<boolean>(false);
  const [coords, setCoords] = useState<{top: number, left: number}>({top: 0, left: 0});

  useLayoutEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${overlayPortalContainerId}`);
    overlayPortalContainerNodeRef.current = node;
    const tooltipElm = tooltipEl.current;
    const rootElm = rootEl.current;
    if (tooltipElm !== null && rootElm !== null) {
      const {top, left} = coords;
      const tooltipSpacing = 15;
      const tooltipHeight = tooltipElm.offsetHeight;
      const tooltipWidth = tooltipElm.offsetWidth;
      let tooltipTopValue = top - tooltipSpacing - tooltipHeight;
      let tooltipLeftValue = left - (tooltipWidth / 2);
      if (tooltipTopValue < 0) {
        // tooltip will be above the window
        tooltipTopValue = top + tooltipSpacing;
      }
      if (tooltipLeftValue < tooltipSpacing) {
        tooltipLeftValue = tooltipSpacing;
      }
      if ((tooltipLeftValue + (tooltipWidth + tooltipSpacing)) > window.innerWidth) {
        // tooltip will exceed the windows width
        tooltipLeftValue = window.innerWidth - tooltipWidth - tooltipSpacing;
      }
      tooltipElm.style.cssText = `
        left: ${tooltipLeftValue}px;
        top: ${tooltipTopValue}px;
        opacity: 1;
      `;
    }
  }, [isTooltipShown, coords]);
  const overlayPortalContainerNode = overlayPortalContainerNodeRef.current;

  let tooltip: React.ReactPortal | null;
  if (isTooltipShown !== false && overlayPortalContainerNode !== null && explanation) {
    tooltip = ReactDOM.createPortal((
      <TooltipBase ref={tooltipEl}>
        {explanation}
        <ArrowContainer>
          <Arrow />
        </ArrowContainer>
      </TooltipBase>
    ), overlayPortalContainerNode);
  } else {
    tooltip = null;
  }

  const onMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
    setIsTooltipShown(true);
  };
  const onMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
    setIsTooltipShown(false);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
  };

  if (children !== undefined) {
    return (
      <GenericSpan
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        ref={rootEl}
        style={{cursor}}
      >
        {children}
        {tooltip}
      </GenericSpan>
    );
  } else {
    return (
      <Root
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{cursor}}
        ref={rootEl}
      >
        <MoreInformationI
          dangerouslySetInnerHTML={{__html: infoCircleSVG}}
        />
        {tooltip}
      </Root>
    );
  }
};

export default Tooltip;
