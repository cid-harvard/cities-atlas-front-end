import {
  backgroundDark,
  ButtonBase,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';
import {breakPointValues} from '../../styling/GlobalGrid';

export const collapsedSizeMediaQueryValues = {
  min: breakPointValues.width.small + 1,
  max: 1280,
};

export const collapsedSizeMediaQuery = `
  screen and
  (min-width: ${collapsedSizeMediaQueryValues.min}px) and
  (max-width: ${collapsedSizeMediaQueryValues.max}px)
`;

export const textClassName = 'expanding-button-responsive-text';

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
