import React from 'react';
import {PrimaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components';
import {
  secondaryFont,
  tertiaryColor,
  backgroundDark,
  defaultPadding,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';
import {Link} from 'react-router-dom';
import {Routes} from '../../../routing/routes';

export const citiesLogoSVG = raw('../../../assets/icons/cities-logo.svg');
export const cityIconSVG = raw('../../../assets/icons/city-icon.svg');


const Root = styled(PrimaryHeaderContainer)`
  font-family: ${secondaryFont};
  background-color: ${backgroundDark};
  text-transform: uppercase;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  border-bottom: solid 3px ${tertiaryColor};
  padding-top: 1rem;
  padding-right: ${defaultPadding}rem;
`;

const Logo = styled.h1`
  margin: 0;
  width: 10rem;
  height: 1.5rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const H2 = styled.h2`
  font-weight: 300;
  padding: 0 ${defaultPadding * 1.3}rem 0.65rem ${defaultPadding * 1.3}rem;
  display: flex;
  align-items: flex-end;
  margin: 0;
  border-bottom: solid 0.4rem ${tertiaryColor};
  font-size: 1.35rem;
  color: #fff;
  line-height: 1;

  @media (max-width: 850px) {
    font-size: 1rem;
  }
`;

const CityIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.45rem;

  @media (max-width: 850px) {
    width: 1.2rem;
    height: 1.2rem;
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

const Header = () => {
  return (
    <Root>
      <StyledLink to={Routes.Landing}>
        <Logo
          dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
        />
      </StyledLink>
      <StyledLink to={Routes.Landing}>
        <H2>
          <CityIcon
            dangerouslySetInnerHTML={{__html: cityIconSVG}}
          />
          Pick a city
        </H2>
      </StyledLink>
    </Root>
  );
};

export default Header;
