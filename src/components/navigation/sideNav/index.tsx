import React, {useRef, useEffect, useState, useContext} from 'react';
import {
  NavigationContainer,
  breakPoints,
  breakPointValues,
} from '../../../styling/GlobalGrid';
import {
  secondaryFont,
  baseColor,
  primaryColor,
  primaryColorLight,
  lightBorderColor,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {
  Link,
  useHistory,
  matchPath,
} from 'react-router-dom';
import AppContext from '../../../contextProviders/appContext';
import MobileMenu from './MobileMenu';

const Root = styled.div`
  width: 240px;
  overflow: hidden;
  position: relative;
  margin: auto;
  box-sizing: border-box;

  svg {
    height: 380px;
    position: relative;
    pointer-events: none;
    left: -2px;

    path {
      fill: none;
      stroke: #1f262b;
      stroke-miterlimit: 10;
      stroke-width: 2px;

      @media not all and (min-resolution:.001dpcm) { @media {
        fill: #fff;
      }}
    }

    circle {
      fill: #151f26;
    }
  }

  @media ${breakPoints.medium} {
    width: 205px;

    svg {
      height: 280px;
    }
  }

  @media ${breakPoints.small} {
    display: none;
    height: auto;
    max-height: initial;
    width: 100%;
    max-width: 300px;
    position: absolute;
    z-index: 100;
    background-color: #fff;
    border: solid 1px ${lightBorderColor};
    margin: 0 auto;
    right: 0;
    left: 0;

    svg {
      display: none;
    }
  }
`;

const clipPathIdDesktop = 'side-navigation-circle-menu-clip-path-desktop';
const clipPathIdTablet = 'side-navigation-circle-menu-clip-path-tablet';

const LinkContainer = styled.div`
  clip-path: url(#${clipPathIdDesktop});

  @media ${breakPoints.medium} {
    webkit-clip-path: none;
    clip-path: url(#${clipPathIdTablet});
  }

  @media ${breakPoints.small} {
    clip-path: none;
  }

  @media not all and (min-resolution:.001dpcm) { @media {
    clip-path: none;
  }}
`;

const acitveLinkClass = 'main-circle-side-nav-active-nav-link-page';

const NavLink = styled(Link)`
  position: absolute;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: -0.3px;
  font-weight: 600;
  text-decoration: none;
  white-space: pre-line;
  padding-left: 1.25rem;
  transform: translate(0, -40%);
  color: ${baseColor};
  transition: all 0.2s ease;
  box-sizing: border-box;
  pointer-events: auto;

  &:after {
    content: '';
    z-index: -1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 150%;
  }

  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    width: 200%;
    height: 120%;
    background-color: ${primaryColorLight};
    top: -10%;
    left: -250%;
    transition: all 0.2s ease;
  }

  &:hover:before, &.${acitveLinkClass}:before {
    left: -95%;
  }

  @media ${breakPoints.medium} {
    font-size: 0.6rem;
  }

  @media ${breakPoints.small} {
    position: static;
    display: block;
    transform: translate(0);
    font-size: 0.85rem;
    margin: 0.5rem 0.5rem;
    padding: 0.5rem 0.5rem 0.85rem;
    border-bottom: solid 1px ${lightBorderColor};
    white-space: normal;

    &:before, &:after {
      display: none;
    }

    &:last-of-type {
      border-bottom: none;
    }
  }
`;

const BetaIcon = styled.div`
  position: absolute;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  letter-spacing: -0.3px;
  font-style: italic;
  font-weight: 600;
  color: #fff;
  background-color: ${primaryColor};
  font-size: 8px;
  padding: 1px 3px 1px 2px;
  top: 0;
  transform: translate(0, calc(-100% - 0.1rem));
  text-align: center;
  font-family: 0.6rem;

  @media ${breakPoints.small} {
    top: -0.3rem;
    right: 0;
  }
`;

interface LinkDatum {
  label: string;
  url: string;
  top: number;
  left: number;
  beta?: boolean;
}

const radius = 4.37;

export interface Props {
  baseLinkData: {label: string, url: string, beta?: boolean}[];
}

const SideNavigation = ({baseLinkData}: Props) => {
  const history = useHistory();
  const {windowDimensions} = useContext(AppContext);

  const [linkData, setLinkData] = useState<LinkDatum[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const circle_0 = useRef<SVGCircleElement | null>(null);
  const circle_1 = useRef<SVGCircleElement | null>(null);
  const circle_2 = useRef<SVGCircleElement | null>(null);
  const circle_3 = useRef<SVGCircleElement | null>(null);
  const circle_4 = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const refArray = [circle_0, circle_1, circle_2, circle_3, circle_4];
    const pageScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const containerPosition = rootRef && rootRef.current ? rootRef.current.offsetTop : 0;
    const offset = pageScrollTop - containerPosition;
    const newLinkDatum: LinkDatum[] = [];
    refArray.forEach((ref, i) => {
      const node = ref.current;
      if (node) {
        const {top, left} = node.getBoundingClientRect();
        newLinkDatum.push({...baseLinkData[i], top: top + offset, left});
      }
    });
    setLinkData([...newLinkDatum]);
  }, [rootRef, circle_0, circle_1, circle_2, circle_3, circle_4, baseLinkData, windowDimensions]);

  const links = linkData.map((d, i) => {
    const match = matchPath(history.location.pathname, baseLinkData[i].url);
    const className = match ? acitveLinkClass : undefined;
    const beta = d.beta ? <BetaIcon>Beta</BetaIcon> : null;
    return (
      <NavLink
        to={d.url + history.location.search}
        key={d.label + d.url}
        style={{top: d.top, left: d.left}}
        className={className}
        onClick={() => mobileMenu ? setMobileMenuOpen(false) : null}
      >
        {d.label}
        {beta}
      </NavLink>
    );
  });

  const mobileMenu = windowDimensions.width <= breakPointValues.width.small ||
                     windowDimensions.height <= breakPointValues.height.small ? (
     <MobileMenu
       baseLinkData={baseLinkData}
       mobileMenuOpen={mobileMenuOpen}
       toggleMenu={() => setMobileMenuOpen(current => !current)}
       closeMenu={() => setMobileMenuOpen(false)}
     />
   ) : null;

  return (
    <NavigationContainer>
      {mobileMenu}
      <Root
        ref={rootRef}
        style={{display: mobileMenuOpen ? 'block' : undefined}}
      >
        <LinkContainer>
        {links}
        </LinkContainer>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 377.85'>
          <clipPath id={clipPathIdDesktop}>
            <path
              d='M0,0v0.8C41.6,35.5,68.3,112,64.4,199.4C61,274.8,35.6,340.1,0,376.4l0,4.4h366.4V0H0z'
            />
          </clipPath>
          <clipPath id={clipPathIdTablet}>
            <path
              d='M0,0v0.6c30.7,25.5,50.4,81.9,47.5,146.3C44.9,202.5,26.2,250.6,0,277.3l0,3.2h270V0H0z'
            />
          </clipPath>
          <path
            d='M569.33,197.85c42.17,34.26,69.37,111.25,65.4,199.38-3.4,75.47-28.83,140.75-64.37,177'
            transform='translate(-568.7 -197.07)'
          />
          <circle ref={circle_0} cx='20.1' cy='20.4' r={radius}/>
          <circle ref={circle_1} cx='53.4' cy='90.1' r={radius}/>
          <circle ref={circle_2} cx='65.7' cy='184.6' r={radius}/>
          <circle ref={circle_3} cx='55.8' cy='269.3' r={radius}/>
          <circle ref={circle_4} cx='25.3' cy='347' r={radius}/>
        </svg>
      </Root>
    </NavigationContainer>
  );
};

export default SideNavigation;
