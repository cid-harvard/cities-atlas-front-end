import React, {useState} from 'react';
import {PrimaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components';
import {
  secondaryFont,
  primaryColor,
  backgroundDark,
  defaultPadding,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';
import {Link} from 'react-router-dom';
import {Routes} from '../../../routing/routes';
import useFluent from '../../../hooks/useFluent';
import {useWindowWidth} from '../../../contextProviders/appContext';

export const citiesLogoSVG = raw('../../../assets/icons/cities-logo.svg');
export const cityIconSVG = raw('../../../assets/icons/city-icon.svg');

const Root = styled(PrimaryHeaderContainer)`
  font-family: ${secondaryFont};
  background-color: ${backgroundDark};
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  border-bottom: solid 3px ${primaryColor};
  padding-top: 1rem;
  box-sizing: border-box;
  pointer-events: auto;

  @media (max-width: 500px) {
    min-height: 4rem;
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: flex-end;
  flex-shrink: 1;
  margin: 0 0.4rem;
`;

const Logo = styled.h1`
  margin: 0 4rem 0 1rem;
  width: 10rem;
  height: 1.5rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }

  @media (max-width: 800px) {
    width: 7.5rem;
    margin: 0 1.75rem 0 1rem;
  }

  @media (max-width: 500px) {
    width: 6.5rem;
    margin: 0 1rem 0 1rem;
  }
`;

const MobileLogo = styled.h1`
  margin: 1rem 1rem 2rem;
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

const H2 = styled.h2<{$active: boolean}>`
  font-weight: 300;
  padding: 0 ${defaultPadding / 2}rem 1.05rem;
  display: flex;
  align-items: flex-end;
  margin: 0;
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  color: #fff;
  line-height: 1;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: ${({$active}) => $active ? '0.4rem' : 0};
    background-color: ${primaryColor};
    transition: height 0.075s ease-in-out;
  }


  &:hover {
    &:after {
      height: 0.4rem;
    }
  }

  @media (max-width: 850px) {
    font-size: 1rem;
  }

  @media (max-width: 800px) {
    padding: 0 0.5rem 1.05rem;
  }
`;

const MobileH2 = styled(H2)`
  margin: 1rem;
  border-bottom: solid 1px ${primaryColor};
`;

const NavIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.45rem;
  line-height: 0;

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

  @media (max-width: 550px) {
    display: none;
  }
`;

const MobileNavIcon = styled(NavIcon)`
  @media (max-width: 550px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  background-color: transparent;
  border: none;
  text-transform: uppercase;
  width: 3rem;
  height: 4rem;
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 0.8rem;
  color: #fff;
  font-family: ${secondaryFont};

  &:hover {
    cursor: pointer;
  }
`;

const Icon = styled.span`
  display: flex;
  width: 20px;
  height: 16px;
  margin-bottom: 0.25rem;
  flex-direction: column;
  justify-content: space-between;
`;
const Bar = styled.span`
  display: inline-block;
  width: 100%;
  height: 0;
  border-top: 2px solid #fff;
  transition: all 0.2s ease;
`;
const CenterBar = styled(Bar)`
  position: relative;

  &:before {
    content: '';
    display: inline-block;
    width: 100%;
    height: 0;
    border-top: 2px solid #fff;
    position: absolute;
    transform-origin: center;
    top: -2px;
    left: 0;
    transition: all 0.2s ease;
  }

  &.close__menu {
    transform: rotate(45deg);

    &:before {
      transform: rotate(90deg);
    }
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: ${backgroundDark};
  z-index: 1000;
  transition: all 0.2s ease;
`;

const Header = () => {
  const getString = useFluent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const {width} = useWindowWidth();
  if (width < 500) {
    const menuButtonText = mobileMenuOpen === false ? getString('global-ui-more') : getString('global-ui-close');
    return (
      <Root>
        <StyledLink to={Routes.Landing}>
          <Logo
            aria-label={getString('global-app-name')}
            dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
          />
        </StyledLink>
        <NavSection>
          <StyledLink to={Routes.Landing}>
            <H2 $active={true}>
              <NavIcon
                dangerouslySetInnerHTML={{__html: cityIconSVG}}
              />
              {getString('navigation-city-profiles')}
            </H2>
          </StyledLink>
          <StyledLink to={'#'}>
            <H2 $active={false}>
              <NavIcon
                dangerouslySetInnerHTML={{__html: cityIconSVG}}
              />
              {getString('navigation-industry-profiles')}
            </H2>
          </StyledLink>
        </NavSection>
        <NavSection>
          <MobileMenu
            style={{transform: mobileMenuOpen ? 'translate(0, 0)' : 'translate(100%, 0)'}}
          >
            <StyledLink to={Routes.Landing}>
              <MobileLogo
                aria-label={getString('global-app-name')}
                dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
              />
            </StyledLink>
            <StyledLink to={Routes.Landing}>
              <MobileH2 $active={true}>
                <MobileNavIcon
                  dangerouslySetInnerHTML={{__html: cityIconSVG}}
                />
                {getString('navigation-city-profiles')}
              </MobileH2>
            </StyledLink>
            <StyledLink to={'#'}>
              <MobileH2 $active={false}>
                <MobileNavIcon
                  dangerouslySetInnerHTML={{__html: cityIconSVG}}
                />
                {getString('navigation-industry-profiles')}
              </MobileH2>
            </StyledLink>
            <StyledLink to={'#'}>
              <MobileH2 $active={false}>
                {getString('navigation-data')}
              </MobileH2>
            </StyledLink>
            <StyledLink to={'#'}>
              <MobileH2 $active={false}>
                {getString('navigation-about')}
              </MobileH2>
            </StyledLink>
            <StyledLink to={'#'}>
              <MobileH2 $active={false}>
                {getString('navigation-contact')}
              </MobileH2>
            </StyledLink>

          </MobileMenu>
          <MobileMenuButton
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              zIndex: mobileMenuOpen ? 2000 : undefined,
              position: mobileMenuOpen ? 'fixed' : undefined,
            }}
          >
            <Icon>
              <Bar style={{opacity: mobileMenuOpen ? 0 : undefined}} />
              <CenterBar className={mobileMenuOpen ? 'close__menu' : undefined} />
              <Bar style={{opacity: mobileMenuOpen ? 0 : undefined}} />
            </Icon>
            {menuButtonText}
          </MobileMenuButton>
        </NavSection>
      </Root>
    );
  } else {
    return (
      <Root>
        <StyledLink to={Routes.Landing}>
          <Logo
            aria-label={getString('global-app-name')}
            dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
          />
        </StyledLink>
        <NavSection>
          <StyledLink to={Routes.Landing}>
            <H2 $active={true}>
              <NavIcon
                dangerouslySetInnerHTML={{__html: cityIconSVG}}
              />
              {getString('navigation-city-profiles')}
            </H2>
          </StyledLink>
          <StyledLink to={'#'}>
            <H2 $active={false}>
              <NavIcon
                dangerouslySetInnerHTML={{__html: cityIconSVG}}
              />
              {getString('navigation-industry-profiles')}
            </H2>
          </StyledLink>
          <StyledLink to={'#'}>
            <H2 $active={false}>
              {getString('navigation-data')}
            </H2>
          </StyledLink>
        </NavSection>
        <NavSection>
          <StyledLink to={'#'}>
            <H2 $active={false}>
              {getString('navigation-about')}
            </H2>
          </StyledLink>
          <StyledLink to={'#'}>
            <H2 $active={false}>
              {getString('navigation-contact')}
            </H2>
          </StyledLink>
        </NavSection>
      </Root>
    );
  }
};

export default Header;
