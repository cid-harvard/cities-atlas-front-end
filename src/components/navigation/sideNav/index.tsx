import React, {useRef, useEffect, useState} from 'react';
import {NavigationContainer} from '../../../styling/GlobalGrid';
import {secondaryFont, baseColor, linkColor} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {
  Link,
  useHistory,
  matchPath,
} from 'react-router-dom';

const Root = styled.div`
  width: 300px;
  height: 100%;
  max-height: 450px;
  overflow: hidden;
  position: relative;
  margin: auto;

  svg {
    height: 100%;
    position: relative;
    pointer-events: none;
    left: -2px;

    path {
      fill: #fff;
      stroke: #1f262b;
      stroke-miterlimit: 10;
      stroke-width: 2px;
    }

    circle {
      fill: #151f26;
    }
  }
`;

const acitveLinkClass = 'main-circle-side-nav-active-nav-link-page';

const NavLink = styled(Link)`
  position: absolute;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 0.95rem;
  text-decoration: none;
  white-space: pre-line;
  padding-left: 1.25rem;
  transform: translate(0, -40%);
  color: ${baseColor};

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
    width: 100%;
    padding-left: 100%;
    height: 100%;
    background-color: ${linkColor};
    left: -95%;
    transform: translate(-100%, 0);
    transition: transform 0.2s ease;
  }

  &:hover:before, &.${acitveLinkClass}:before {
    transform: translate(0, 0);
  }
`;

interface LinkDatum {
  label: string;
  url: string;
  top: number;
  left: number;
}

const radius = 4.37;

export interface Props {
  baseLinkData: {label: string, url: string}[];
}

const SideNavigation = ({baseLinkData}: Props) => {
  const history = useHistory();

  const [linkData, setLinkData] = useState<LinkDatum[]>([]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const circle_0 = useRef<SVGCircleElement | null>(null);
  const circle_1 = useRef<SVGCircleElement | null>(null);
  const circle_2 = useRef<SVGCircleElement | null>(null);
  const circle_3 = useRef<SVGCircleElement | null>(null);
  const circle_4 = useRef<SVGCircleElement | null>(null);
  const circle_5 = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const refArray = [circle_0, circle_1, circle_2, circle_3, circle_4, circle_5];
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
  }, [rootRef, circle_0, circle_1, circle_2, circle_3, circle_4, circle_5, baseLinkData]);

  const links = linkData.map((d, i) => {
    const match = matchPath(history.location.pathname, baseLinkData[i].url);
    const className = match && match.isExact ? acitveLinkClass : undefined;
    return (
      <NavLink to={d.url} key={d.label + d.url} style={{top: d.top, left: d.left}} className={className}>
        {d.label}
      </NavLink>
    );
  });

  return (
    <NavigationContainer>
      <Root ref={rootRef}>
        {links}
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 69.02 377.85'>
          <path
            d='M569.33,197.85c42.17,34.26,69.37,111.25,65.4,199.38-3.4,75.47-28.83,140.75-64.37,177'
            transform='translate(-568.7 -197.07)'
          />
          <circle ref={circle_0} cx='20.13' cy='20.42' r={radius}/>
          <circle ref={circle_1} cx='51.28' cy='81.38' r={radius}/>
          <circle ref={circle_2} cx='64.66' cy='152.37' r={radius}/>
          <circle ref={circle_3} cx='64.66' cy='223.37' r={radius}/>
          <circle ref={circle_4} cx='51.58' cy='286.89' r={radius}/>
          <circle ref={circle_5} cx='25.3' cy='346.99' r={radius}/>
        </svg>
      </Root>
    </NavigationContainer>
  );
};

export default SideNavigation;
