import { createGlobalStyle } from 'styled-components/macro';
import {
  baseColor,
  lightBaseColor,
  semiBoldFontBoldWeight,
  primaryFont,
} from './styleUtils';

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
`;

export default GlobalStyles;
