import styled, { keyframes, css } from "styled-components/macro";
import { breakPoints, breakPointValues } from "./GlobalGrid";
import { rgba } from "polished";

export const baseColor = "#333333"; // dark gray/black color for text
export const lightBaseColor = "#7c7c7c"; // light gray color for subtitles and contextual information
export const lightBorderColor = "#dcdcdc"; // really light gray color for subtle borders between elements
export const mapLabelColor = "#04151b"; // dark blue/black

export const hoverBackgroundColor = "#f3f3f3"; // really light gray color for use as a hover background color on cards

export const primaryColor = "#f89570"; // orange
export const primaryHoverColor = "#ef8963"; // slightly dark orange
export const primaryColorDark = "#f56b39"; // dark orange
export const primaryColorLight = "#fdd4c7"; // light orange
export const secondaryColor = "#3b848d"; // blue/teal
export const tertiaryColor = "#cfbc3c"; // yellow

export const backgroundMedium = "#e6e7e8"; // dark blue gray
export const backgroundDark = "#2e353f"; // dark blue gray
export const medGray = "#4d565e";

export const benchmarkColor = " #32a58f"; // greenish blue

export const linkColor = "#6accc2";

export const errorColor = "#f43a16"; // reddish color

export const primaryColorRange = [
  primaryColor,
  "#f9a180",
  "#faad90",
  "#fbc5b1",
  "#fcd1c1",
];

export const sectorColorMap = [
  { id: "0", color: "#A973BE" },
  { id: "1", color: "#F1866C" },
  { id: "2", color: "#FFC135" },
  { id: "3", color: "#93CFD0" },
  { id: "4", color: "#488098" },
  { id: "5", color: "#77C898" },
  { id: "6", color: "#6A6AAD" },
  { id: "7", color: "#D35162" },
  { id: "8", color: "#F28188" },
];

export const clusterColorMap = [
  { id: "1", color: "#999932" }, // Basic Materials
  { id: "2", color: "#485999" }, // Manufacturing
  { id: "3", color: "#37AF98" }, // Food
  { id: "4", color: "#65CEE0" }, // Durables
  { id: "5", color: "#873261" }, // Logistics
  { id: "6", color: "#B76274" }, // Services
  { id: "7", color: "#DDCC77" }, // Finance
];

export const intensityColorRange = ["#c2e5fc", "#003e59"];

export const educationColorRange = ["#5aad60", "#eaebcc", "#986faa"];

export const wageColorRange = ["#4a7ab7", "#eaebcc", "#dc3d2d"];

export const primaryFont = "'Source Sans Pro', sans-serif";
export const secondaryFont = "'OfficeCodeProWeb', monospace";

export const semiBoldFontBoldWeight = 600;
export const boldFontWeight = 700;

export const defaultPadding = 2; // in rems

export const noOutlineOnFocus = css`
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

export const ContentGrid = styled.div`
  padding: 0 0.75rem 0.25rem;
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-height: 100%;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 21rem;
  grid-column-gap: 2rem;

  @media screen and (max-width: 1350px) {
    grid-template-columns: 1fr 17.5rem;
    grid-column-gap: 1rem;
  }

  @media screen and (max-width: ${breakPointValues.width.medium}px) {
    grid-template-columns: 1fr 14.5rem;
    grid-column-gap: 1rem;
  }

  @media screen and (max-width: ${breakPointValues.width.mediumSmall}px) {
    grid-template-columns: 1fr 11rem;
  }

  @media ${breakPoints.small} {
    grid-template-rows: auto auto 80vh auto;
    grid-template-columns: 1fr;
  }
`;

export const ContentScrollGrid = styled.div`
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-height: 100%;
  grid-template-columns: 21rem 1fr;
  grid-column-gap: 2rem;

  @media screen and (max-width: 1350px) {
    grid-template-columns: 17.5rem 1fr;
    grid-column-gap: 1rem;
  }

  @media ${breakPoints.small} {
    grid-template-rows: auto auto;
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

export const BasicLabel = styled.div`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const BasicLabelBackground = styled.span`
  background-color: rgba(255, 255, 255, 0.7);
  padding: 0.075rem 0.175rem;
`;

export const SearchContainerDark = styled.div`
  pointer-events: all;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 990px) {
    width: 95%;
  }

  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-size: 0.85rem;
    background-color: ${rgba(backgroundDark, 0.85)};
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
    background-color: ${rgba(backgroundDark, 0.85)};
    border: solid 1px #fff;

    ::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    color: #fff;
    border-color: ${primaryColor};
  }

  .react-panel-search-current-tier-breadcrumb-outer:hover {
    background-color: rgba(255, 255, 255, 0.35);
  }

  .react-panel-search-list-item {
    background-color: transparent;
    color: #fff;
    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.35);
  }

  .react-panel-search-search-results:hover {
    .react-panel-search-highlighted-item:not(:hover) {
      background-color: transparent;
    }
  }

  .react-panel-search-list-item-container {
    strong {
      color: ${primaryColorDark};
    }
  }

  .react-panel-search-list-no-results {
    color: #fff;
  }
`;

export const SearchContainerLight = styled.div`
  width: 100%;
  font-family: ${secondaryFont};
  letter-spacing: -0.3px;

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
    letter-spacing: -0.3px;
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 0.85rem;
    border: solid 1px ${lightBaseColor};
    box-shadow: none;
    outline: none;

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

  .react-panel-search-list-item-container {
    strong {
      color: ${primaryColorDark};
    }
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    border-color: ${primaryColor};
  }
`;

export const BlockButton = styled.button`
  padding: 0.4rem;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  margin-bottom: 0.75rem;
  border: solid 1px ${backgroundDark};
  color: ${backgroundDark};
  background-color: #fff;
  border-radius: 0;
  transition: all 0.1s ease-in-out;

  &:hover {
    color: #fff;
    background-color: ${backgroundDark};
  }

  @media ${breakPoints.medium} {
    font-size: 0.75rem;
  }
`;

export const BlockButtonHighlighted = styled(BlockButton)`
  background-color: ${backgroundDark};
  color: #fff;

  &:hover {
    background-color: ${backgroundDark};
  }
`;

export const FullPageOverlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 500;
`;

export const radioButtonCss = css<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  position: relative;

  &:before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 200px;
    border: solid 1px #fff;
    margin-right: 4px;
    flex-shrink: 0;
  }

  &:after {
    ${({ $checked }) => ($checked ? "content: '';" : "")}
    width: 6px;
    height: 6px;
    border-radius: 200px;
    background-color: #fff;
    transform: translate(4px, 0);
    position: absolute;
    flex-shrink: 0;
  }

  &:hover {
    background-color: #fff;
    color: ${backgroundDark};

    &:before {
      border-color: ${backgroundDark};
    }

    &:after {
      background-color: ${backgroundDark};
    }
  }
`;

export const ContentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;

  @media ${breakPoints.medium} {
    font-size: 1rem;
  }

  @media ${breakPoints.mediumSmall} {
    font-size: 0.95rem;
  }

  @media ${breakPoints.small} {
    font-size: 1.3rem;
  }
`;

export const ContentParagraph = styled.p`
  font-size: 0.9rem;

  @media ${breakPoints.medium} {
    font-size: 0.75rem;
  }

  @media ${breakPoints.mediumSmall} {
    font-size: 0.65rem;
  }

  @media ${breakPoints.small} {
    font-size: 0.95rem;
  }
`;

export const ButtonBase = styled.button`
  color: ${backgroundDark};
  background-color: transparent;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-size: clamp(0.75rem, 1.1vw, 0.9rem);
  padding: 0.25rem;
  padding: clamp(0.25rem, 0.4vw, 0.5rem);
  flex-shrink: 0;

  span {
    width: 0.65rem;
    width: clamp(0.65rem, 1.5vw, 0.85rem);
    height: 0.65rem;
    height: clamp(0.65rem, 1.5vw, 0.85rem);
    display: inline-block;
    line-height: 0;
    margin-right: 0.25rem;

    svg {
      width: 100%;
      height: 100%;
      fill: ${backgroundDark};
    }
  }

  &:hover {
    background-color: ${backgroundDark};
    color: #fff;

    span svg {
      fill: #fff;
    }
  }
`;

export const Mult = styled.span`
  position: relative;
  bottom: -0.2em;
`;
export const FractionMult = styled.span`
  position: relative;
  bottom: -0.5em;
`;

export const PointerActiveContainer = styled.div`
  pointer-events: all;
`;
