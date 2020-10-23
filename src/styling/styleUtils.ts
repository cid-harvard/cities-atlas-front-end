import styled, {keyframes, css} from 'styled-components/macro';
import {rgba} from 'polished';
import {breakPoints} from './GlobalGrid';

export const baseColor = '#333333'; // dark gray/black color for text
export const lightBaseColor = '#7c7c7c'; // light gray color for subtitles and contextual information
export const lightBorderColor = '#dcdcdc'; // really light gray color for subtle borders between elements
export const mapLabelColor = '#04151b'; // dark blue/black

export const hoverBackgroundColor = '#f3f3f3'; // really light gray color for use as a hover background color on cards

export const primaryColor = '#f89570'; // orange
export const primaryColorLight = rgba('#f89570', 0.4); // light orange
export const secondaryColor = '#3b848d'; // blue/teal
export const tertiaryColor = '#cfbc3c'; // yellow

export const backgroundMedium = '#e6e7e8'; // dark blue gray
export const backgroundDark = '#2e353f'; // dark blue gray

export const linkColor = '#6accc2';

export const errorColor = '#f43a16'; // reddish color

export const primaryColorRange = [
  primaryColor,
  '#f9a180',
  '#faad90',
  '#fbc5b1',
  '#fcd1c1',
];

export const sectorColorMap = [
  { id: '0', color: '#A973BE' },
  { id: '1', color: '#F1866C' },
  { id: '2', color: '#FFC135' },
  { id: '3', color: '#93CFD0' },
  { id: '4', color: '#488098' },
  { id: '5', color: '#77C898' },
  { id: '6', color: '#6A6AAD' },
  { id: '7', color: '#D35162' },
  { id: '8', color: '#F28188' },
];

export const primaryFont = "'Source Sans Pro', sans-serif";
export const secondaryFont = "'OfficeCodeProWeb', monospace";

export const semiBoldFontBoldWeight = 600;
export const boldFontWeight = 700;

export const defaultPadding = 2; // in rems

export const ContentGrid = styled.div`
  padding: 1rem;
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-height: 100%;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 23rem;
  grid-column-gap: 3vw;

  @media ${breakPoints.medium} {
    grid-template-columns: 1fr 20rem;
  }

  @media ${breakPoints.small} {
    grid-template-rows: auto 80vh auto;
    grid-template-columns: 1fr;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

export const fadeInAnimation = css`
  opacity: 0;
  animation: ${fadeIn} 0.2s linear 1 forwards;
`;

export const SearchContainerDark = styled.div`
  pointer-events: all;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 990px) {
    width: 85%;
  }

  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-size: 0.85rem;
    background-color: rgba(0, 0, 0, 0.35);
    color: #fff;
    border: solid 1px #fff;
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-right: 3rem;
    box-shadow: none;
    outline: none;

    &::placeholder {
      color: #fff;
    }

    &:focus::placeholder {
      color: rgba(0, 0, 0, 0);
    }
  }

  .react-panel-search-search-bar-dropdown-arrow {
    background-color: transparent;

  }
  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: #fff;
    }
  }

  .react-panel-search-search-bar-clear-button {
    background-color: transparent;
    color: #fff;
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: #fff;
    }
  }

  .react-panel-search-search-results {
    background-color: rgba(0, 0, 0, 0.35);
    border: solid 1px #fff;

    ::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, .3);
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, .1);
    }
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    color: #fff;
    border-color: ${primaryColor};
  }

  .react-panel-search-current-tier-breadcrumb-outer:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-list-item {
    background-color: transparent;
    color: #fff;
    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-search-results:hover {
    .react-panel-search-highlighted-item:not(:hover) {
      background-color: transparent;
    }
  }
`;

export const SearchContainerLight = styled.div`
  width: 100%;
  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-search-icon {
    display: none;
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 1rem;
    border: solid 1px ${lightBaseColor};
    box-shadow: none;
    outline: none;
    padding: 0.4rem 0.5rem;

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
  }

  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: ${lightBaseColor};
    }
  }
  .react-panel-search-search-bar-dropdown-arrow {
    width: 1rem;
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: ${lightBaseColor};
    }
  }

  .react-panel-search-search-results {
    border-left: solid 1px ${lightBaseColor};
    border-right: solid 1px ${lightBaseColor};
    border-bottom: solid 1px ${lightBaseColor};
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    border-color: ${primaryColor};
  }
`;
