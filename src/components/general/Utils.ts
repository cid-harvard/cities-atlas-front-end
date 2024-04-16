import { backgroundDark, ButtonBase } from "../../styling/styleUtils";
import styled from "styled-components/macro";
import { breakPointValues } from "../../styling/GlobalGrid";
import { DataFlagType } from "../../types/graphQL/graphQLTypes";

export const collapsedSizeMediaQueryValues = {
  min: breakPointValues.width.small + 1,
  max: 1280,
};

export const collapsedSizeMediaQuery = `
  screen and
  (min-width: ${collapsedSizeMediaQueryValues.min}px) and
  (max-width: ${collapsedSizeMediaQueryValues.max}px)
`;

export const textClassName = "expanding-button-responsive-text";

export const ExpandingButton = styled(ButtonBase)`
  margin-right: 0.25rem;
  position: relative;
  font-size: 0.85rem;

  @media ${collapsedSizeMediaQuery} {
    background-color: ${backgroundDark};
    border-radius: 4000px;
    position: absolute;
    left: 0;
    border: solid 2px transparent;
    display: flex;
    justify-content: center;
    outline: none;
    font-size: 0.7rem;
    padding: 0;

    span {
      margin: 0;
      width: 1.3rem;
      height: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        padding: 0;
        width: 0.75rem;
        height: 0.75rem;
        fill: #fff;
      }
    }

    .${textClassName} {
      white-space: nowrap;
      opacity: 0;
      width: 0;
      /* max-width needed for safari */
      max-width: 0;
      transition: all 0.15s ease-in-out;
      color: #fff;
      border-top-right-radius: 4000px;
      border-bottom-right-radius: 4000px;
      background-color: ${backgroundDark};
      display: flex;
      align-items: center;
      padding-left: 0;
      pointer-events: none;
      overflow: hidden;
    }

    &:hover {
      box-shadow: 0px 0px 0px 1px #fff;
      z-index: 100;

      .${textClassName} {
        opacity: 1;
        width: 118px;
        /* max-width needed for safari */
        max-width: 118px;
        padding-left: 0.15rem;
      }
    }
  }
`;

/* Utilities for new data quality indicators:

In the database, data quality levels are defined as
GREEN, YELLOW, ORANGE, and RED.

In the new data quality indicators, the following
changes are implemented:

  GREEN and YELLOW -> "high quality"
  ORANGE -> "medium quality"
  RED -> "low quality"

*/
export enum NewDataQualityLevel {
  HIGH = "high-quality",
  MEDIUM = "medium-quality",
  LOW = "low-quality",
}

export const dataQualityColors: any = new Map([
  [NewDataQualityLevel.LOW, "#b12417"],
  [NewDataQualityLevel.MEDIUM, "#f3b23d"],
  [NewDataQualityLevel.HIGH, "#4eaba7"],
]);

export const getNewDataQualityLevel = (
  dataFlag: DataFlagType,
): NewDataQualityLevel => {
  let assignedNewDataQualityLevel: any;
  if (dataFlag === DataFlagType.GREEN) {
    assignedNewDataQualityLevel = NewDataQualityLevel.HIGH;
  } else if (
    dataFlag === DataFlagType.YELLOW ||
    dataFlag === DataFlagType.ORANGE
  ) {
    assignedNewDataQualityLevel = NewDataQualityLevel.MEDIUM;
  } else if (dataFlag === DataFlagType.RED) {
    assignedNewDataQualityLevel = NewDataQualityLevel.LOW;
  }

  return assignedNewDataQualityLevel;
};
