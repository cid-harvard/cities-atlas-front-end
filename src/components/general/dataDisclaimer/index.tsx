import React, { useState } from "react";
import styled, { keyframes } from "styled-components/macro";
import {
  UtilityBarButtonBase,
  mediumSmallBreakpoint,
  columnsToRowsBreakpoint,
  SvgBase,
  Text,
  TooltipContent,
} from "../../navigation/Utils";
import raw from "raw.macro";
import {
  baseColor,
  secondaryFont,
  primaryColor,
  primaryHoverColor,
} from "../../../styling/styleUtils";
import useFluent from "../../../hooks/useFluent";
import useCurrentCity from "../../../hooks/useCurrentCity";
import Modal from "../../standardModal";
import { Link } from "react-router-dom";
import { Routes } from "../../../routing/routes";
import Tooltip, { TooltipPosition } from "../../general/Tooltip";
import { useWindowWidth } from "../../../contextProviders/appContext";
import {
  dataQualityColors,
  getNewDataQualityLevel,
  NewDataQualityLevel,
} from "../Utils";

const dataIconSvg = raw("../../../assets/icons/disclaimer.svg");

const DisclaimerSvg = styled(SvgBase)<{ $flagColor: string }>`
  width: 1.2rem;
  height: 1.2rem;

  svg {
    .cls-1 {
      fill: none;
      stroke: ${({ $flagColor }) => $flagColor};
    }
    .cls-2 {
      fill: ${({ $flagColor }) => $flagColor};
    }
    circle {
      fill: ${({ $flagColor }) => $flagColor};
    }
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1rem;
    height: 1rem;
  }
`;

const DisclaimerSvgLarge = styled(DisclaimerSvg)`
  width: 2rem;
  height: 2rem;
  margin-right: 0.875rem;

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  background-color: #fff;
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: ${baseColor};
  height: 100%;
  padding: 1rem 3rem 2rem;
  width: 600px;
  max-width: 100%;
  box-sizing: border-box;

  @media screen and (max-height: 800px) {
    overflow: visible;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  font-weight: 400;
  border-bottom: solid 1px ${baseColor};
  padding-bottom: 0.875rem;
`;

const Para = styled.p`
  font-size: 0.875rem;
  margin: 1rem 0;

  a {
    color: ${primaryColor};

    &:hover {
      color: ${primaryHoverColor};
    }
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0 0.5rem;
  color: ${baseColor};
  text-transform: uppercase;
  font-size: 1.5rem;
  font-family: ${secondaryFont};
  position: absolute;
  right: 0;
  top: 0;
`;

const EnlargedTextLabel = styled(Text)`
  width: max-content;
`;

const DataLegend = styled.div`
  margin-right: 0.2rem;
  display: inline-flex;
  flex-direction: row-reverse;
  align-items: center;
`;

const LargeDot = styled.div`
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 1000px;
  margin-right: 0.275rem;
`;

const DataDisclaimer = () => {
  const getString = useFluent();
  const currentCity = useCurrentCity();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const windowDimensions = useWindowWidth();

  let flagColor: string = baseColor;
  let alertTitle: string = "";
  let description: string = "";
  if (currentCity && currentCity.city) {
    const { dataFlag } = currentCity.city;
    const dataQualityLevel = getNewDataQualityLevel(dataFlag);
    flagColor = dataQualityColors.get(dataQualityLevel);

    if (dataQualityLevel === NewDataQualityLevel.HIGH) {
      alertTitle = getString("data-disclaimer-high-quality-topbar-title");
      description = getString("data-disclaimer-high-quality-desc");
    } else if (dataQualityLevel === NewDataQualityLevel.MEDIUM) {
      alertTitle = getString("data-disclaimer-medium-quality-topbar-title");
      description = getString("data-disclaimer-medium-quality-desc");
    } else if (dataQualityLevel === NewDataQualityLevel.LOW) {
      alertTitle = getString("data-disclaimer-low-quality-topbar-title");
      description = getString("data-disclaimer-low-quality-desc");
    }
  }

  const modal = modalOpen ? (
    <Modal onClose={() => setModalOpen(false)} width={"600px"} height={"600px"}>
      <Root>
        <Title>
          <DisclaimerSvgLarge
            dangerouslySetInnerHTML={{ __html: dataIconSvg }}
            $flagColor={flagColor}
          />
          {getString("global-ui-data-disclaimer")} - {alertTitle}
        </Title>
        <Para dangerouslySetInnerHTML={{ __html: description }} />
        <Para>
          {getString("data-disclaimer-data-page-lead-up")}
          &nbsp;
          <Link to={Routes.FaqBase}>
            {getString("data-disclaimer-data-page-link-text")}
          </Link>
        </Para>
        <Para
          dangerouslySetInnerHTML={{
            __html: getString("data-disclaimer-contact"),
          }}
        />
        <CloseButton onClick={() => setModalOpen(false)}>✕</CloseButton>
      </Root>
    </Modal>
  ) : null;

  return (
    <>
      <Tooltip
        explanation={
          windowDimensions.width < mediumSmallBreakpoint &&
          windowDimensions.width > columnsToRowsBreakpoint ? (
            <TooltipContent>
              {getString("global-ui-data-disclaimer")}
            </TooltipContent>
          ) : null
        }
        cursor="pointer"
        tooltipPosition={TooltipPosition.Bottom}
      >
        <UtilityBarButtonBase onClick={() => setModalOpen(true)}>
          <LargeDot style={{ backgroundColor: flagColor }} />
          <EnlargedTextLabel>{alertTitle}</EnlargedTextLabel>
        </UtilityBarButtonBase>
      </Tooltip>
      {modal}
    </>
  );
};

export default DataDisclaimer;
