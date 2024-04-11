import { createGlobalStyle } from "styled-components/macro";
import {
  baseColor,
  lightBaseColor,
  semiBoldFontBoldWeight,
  primaryFont,
  backgroundDark,
} from "./styleUtils";

const GlobalStyles = createGlobalStyle`
  @media(max-width: 600px) {
    html {
      font-size: 14px;
    }
  }
  @media(max-width: 450px) {
    html {
      font-size: 12px;
    }
  }

  body {
    font-family: ${primaryFont};
    color: ${baseColor};
    margin: 0;
    padding: 0;
  }

  h1 {
    font-weight: ${semiBoldFontBoldWeight};
    font-size: 1.7rem;
  }

  h2 {
    font-weight: 400;
    font-size: 1.4rem;
    text-transform: uppercase;
  }

  h3 {
    font-weight: ${semiBoldFontBoldWeight};
    font-size: 1.1rem;
    color: ${lightBaseColor};
  }

  p {
    line-height: 1.5;
    margin: 0 0 1rem;
  }

  button {
    cursor: pointer;
    border: none;
    width: auto;
    text-align: inherit;
    overflow: visible;

    /* Normalize 'line-height'. Cannot be changed from 'normal' in Firefox 4+. */
    line-height: normal;

    /* Corrects font smoothing for webkit */
    -webkit-font-smoothing: inherit;
    -moz-osx-font-smoothing: inherit;

    /* Corrects inability to style clickable 'input' types in iOS */
    -webkit-appearance: none;

    /* Remove excess padding and border in Firefox 4+ */
    &::-moz-focus-inner {
        border: 0;
        padding: 0;
    }
  }

  ol {
    padding-left: 1rem;

    li {
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
    }
  }

  .rapid-tooltip-title {
    padding: 0.5rem;
  }

  .rapid-tooltip-subsection-grid {
    display: grid;
    grid-gap: 0.5rem;
    padding: 0.5rem;
    align-items: center;
  }

  .rapid-tooltip-cell {
    display: flex;
  }

  .rapid-tooltip-arrow-container {
    width: 100%;
    height: 0.5rem;
    display: flex;
    justify-content: center;
    position: absolute;
    transform: translate(0, 100%);
  }

  .rapid-tooltip-arrow {
    width: 0.5rem;
    height: 0.5rem;
    position: relative;
    display: flex;
    justify-content: center;
    left: -0.25rem;

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
  }

  /********
      MAPBOX CUSTOM STYLES
  ********/
  .mapboxgl-popup {
    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 4px;
      overflow: hidden;
      font-size: 0.7rem;
      line-height: 1.4;
      color: #333;
    }
  }

  /*******
    TYPEFORM CUSTOM STYLES
  *******/
  .typeform-popover {
    &.open {
      bottom: 1.5rem;
      right: 0.5rem;
    }
    .typeform-popover-button {
      width: auto;
      height: 1.25rem;
      bottom: 0;
      right: 0.5rem;
      border-radius: 0;
      background-color: ${backgroundDark} !important;
    }

    .typeform-popover-button-icon {
      svg {
        display: none;
      }

      text-transform: uppercase;
      font-family: ${primaryFont};
      font-size: 0.9rem;
      display: flex;
      align-items: center;

      &:before {
        content: "Help us improve Metroverse";
        font-size: 0.75rem;
        margin-right: 0.5rem;
      }

      .typeform-spinner {
        top: auto;
        left: auto;
        width: 1rem;
        height: 1rem;
        position: relative;
        margin: 0;
      }

    }

    @media (min-width: 1385px) {
      .typeform-popover-button {
        height: 1.75rem;
      }

      .typeform-popover-button-icon {
        &:before {
          font-size: 0.875rem;
        }
      }
    }

    &:not(.open) {
      .typeform-popover-button-icon:not([data-testid="spinner-icon"]):after {
        content: '';
          border: solid white;
          border-width: 0 2px 2px 0;
          display: inline-block;
          transform: rotate(-135deg) translate(-1px, -3px);
          padding: 3px;
      }
    }
  }
`;

export default GlobalStyles;
