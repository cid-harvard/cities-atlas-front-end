import styled from 'styled-components/macro';
import {breakPoints} from './GlobalGrid';

export const baseColor = '#333333'; // dark gray/black color for text
export const lightBaseColor = '#7c7c7c'; // light gray color for subtitles and contextual information
export const lightBorderColor = '#dcdcdc'; // really light gray color for subtle borders between elements
export const mapLabelColor = '#04151b'; // dark blue/black

export const hoverBackgroundColor = '#f3f3f3'; // really light gray color for use as a hover background color on cards

export const primaryColor = '#f89570'; // blue/teal
export const secondaryColor = '#3b848d'; // orange
export const tertiaryColor = '#cfbc3c'; // yellow

export const backgroundMedium = '#e6e7e8'; // dark blue gray
export const backgroundDark = '#2e353f'; // dark blue gray

export const linkColor = '#6accc2';

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
  grid-template-columns: 1fr 25rem;

  @media ${breakPoints.medium} {
    grid-template-columns: 1fr 20rem;
  }

  @media ${breakPoints.small} {
    grid-template-rows: auto 80vh auto;
    grid-template-columns: 1fr;
  }
`;
