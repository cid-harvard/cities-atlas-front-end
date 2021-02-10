import {Datum as SearchDatum} from 'react-panel-search';
import {
  Coordinate,
} from '../../components/map/Utils';
import { Popup } from 'react-mapbox-gl';
import styled from 'styled-components/macro';
import {
  secondaryColor,
  secondaryFont,
} from '../../styling/styleUtils';

export interface ExtendedSearchDatum extends SearchDatum {
  center: Coordinate;
  coordinates: Coordinate[];
  population: number;
  gdp: number;
}

export const StyledPopup = styled(Popup)`
  /* && needed to override global styling */
  && .mapboxgl-popup-content {
    border-radius: 0;
    padding: 1rem 1.1rem;
    position: relative;
    background-color: ${secondaryColor};
    color: #fff;
    font-family: ${secondaryFont};
    pointer-events: none;
  }

  .mapboxgl-popup-tip {
    visibility: hidden;
  }
`;

export const TootltipTitle = styled.h2`
  text-transform: uppercase;
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  text-align: center;
`;
