import React from 'react';
import styled from 'styled-components';
import {
  secondaryFont,
  primaryColor,
} from '../../styling/styleUtils';
import raw from 'raw.macro';

const citiesLogoSVG = raw('../../assets/icons/cities-logo.svg');
const cityIconSVG = raw('../../assets/icons/city-icon.svg');
const mapPanSVG = raw('../../assets/icons/map-pan.svg');

const Root = styled.div`
  font-family: ${secondaryFont};
  pointer-events: none;
  color: #fff;
  text-transform: uppercase;
`;

const Logo = styled.h1`
  position: fixed;
  z-index: 300;
  top: 0;
  right: 0;
  margin: 1rem 2rem;
  width: 12rem;
  height: 2.5rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }
`;

const H2 = styled.h2`
  font-weight: 400;
  padding-bottom: 0.35rem;
  border-bottom: solid 0.3rem ${primaryColor};
  display: flex;
  align-items: flex-end;

  @media (max-width: 850px) {
    font-size: 1.2rem;
  }
`;

const Description = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 4rem 0;
  color: #fff;
  font-weight: 400;
  font-size: 1.2rem;

  @media (max-width: 850px) {
    font-size: 0.95rem;
    margin: 1.85rem 0;
  }
`;

const CityIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 0.45rem;

  @media (max-width: 850px) {
    width: 1.75rem;
    height: 1.75rem;
  }

  svg {
    width: 100%;
    height: 100%;

    path,
    rect {
      fill: #fff;
    }
  }
`;

const Or = styled.span`
  display: flex;
  flex-direction: column;
  height: 5rem;
  align-items: center;
  margin: 0 1.5rem;

  &:before,
  &:after {
    content: '';
    display: block;
    flex-grow: 1;
    border-left: solid 2px #fff;
  }
`;

const UseMapText = styled.span`
  display: flex;
  align-items: center;
`;

const MapPanIcon = styled.span`
  display: inline-block;
  width: 2.4rem;
  height: 2.4rem;
  margin-right: 0.85rem;

  @media (max-width: 850px) {
    width: 1.75rem;
    height: 1.75rem;
  }

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }
`;

const Heading = () => {
  return (
    <Root>
      <Logo
        dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
      />
      <H2>
        <CityIcon
          dangerouslySetInnerHTML={{__html: cityIconSVG}}
        />
        Pick a city
      </H2>
      <Description>
        <span>Type a city name</span>
        <Or>or</Or>
        <UseMapText>
          <MapPanIcon
            dangerouslySetInnerHTML={{__html: mapPanSVG}}
          />
          use the map
        </UseMapText>
      </Description>
    </Root>
  );
};

export default Heading;
