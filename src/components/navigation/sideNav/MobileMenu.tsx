import React from 'react';
import styled from 'styled-components/macro';
import {
  breakPoints,
} from '../../../styling/GlobalGrid';
import {
  Link,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {Props as BaseProps} from './';
import {
  baseColor,
  primaryColorLight,
  secondaryFont,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';

const Root = styled.div`
  padding-top: 0.75rem;
  display: none;
  align-items: center;
  justify-content: center;
  grid-template-columns: auto 1fr auto;

  @media ${breakPoints.small} {
    display: grid;
  }
`;

const MobileButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileButton = styled.button`
  background-color: ${primaryColorLight};
  border: none;
  padding: 0.75rem 1.25rem;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 0.85rem;
  color: ${baseColor};
  max-width: 300px;
  display: flex;
  align-items: center;
  pointer-events: all;
`;

const ChevronSVG = raw('../../../assets/icons/chevron.svg');

const arrowStyles = `
  margin: 1rem 0.5rem;
  color: ${baseColor};
  text-decoration: none;
  pointer-events: all;
`;

const ArrowBase = styled(Link)`
  ${arrowStyles}
`;

const DisabledArrow = styled.div`
  ${arrowStyles}
  opacity: 0.25;
`;

const SvgBase = styled.div`
  width: 2.75rem;
  height: 1.85rem;
  padding: 0.35rem 0.5rem;
  box-sizing: border-box;

  svg {
    width: 100%;
    height: 100%;

    polyline {
      stroke: ${baseColor};
    }
  }
`;

const NextSvg = styled(SvgBase)`
  svg {
    transform: rotate(-90deg);
  }
`;
const PrevSvg = styled(SvgBase)`
  svg {
    transform: rotate(90deg);
  }
`;

const DownArrow = styled.span`
  width: 0.9rem;
  height: 0.9rem;
  margin: 0 0.7rem;
  flex-shrink: 0;
  display: inline-block;
  box-sizing: border-box;

  svg {
    width: 100%;
    height: 100%;

    polyline {
      fill: ${baseColor};
    }
  }
`;

const UpArrow = styled(DownArrow)`
  svg {
    transform: rotate(180deg);
  }
`;

interface Props extends BaseProps {
  mobileMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const MobileMenu = ({baseLinkData, toggleMenu, mobileMenuOpen, closeMenu}: Props) => {
  const history = useHistory();

  if (baseLinkData.length === 0) {
    console.warn('MobileMenu component are recieving baseLinkData of length 0');
    return null;
  }

  const linkIndex = baseLinkData.findIndex(d => {
    const match = matchPath(history.location.pathname, d.url);
    return match ? true : false;
  });

  if (linkIndex === -1) {
    console.warn('URL did not match any links provided to MobileMenu component');
    return null;
  } else {
    const pageTitle = baseLinkData[linkIndex].label;
    const prevLink = linkIndex > 0 ? (
      <ArrowBase
        to={baseLinkData[linkIndex - 1].url + history.location.search}
        onClick={() => closeMenu()}
      >
        <PrevSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </ArrowBase>
    ) : (
      <DisabledArrow>
        <PrevSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </DisabledArrow>
    );
    const nextLink = linkIndex < baseLinkData.length - 1 ? (
      <ArrowBase
        to={baseLinkData[linkIndex + 1].url + history.location.search}
        onClick={() => closeMenu()}
      >
        <NextSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </ArrowBase>
    ) : (
      <DisabledArrow>
        <NextSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </DisabledArrow>
    );

    const toggleArrow = mobileMenuOpen
      ? (<UpArrow dangerouslySetInnerHTML={{__html: ChevronSVG}} />)
      : (<DownArrow dangerouslySetInnerHTML={{__html: ChevronSVG}} />);

    return (
      <Root>
        {prevLink}
        <MobileButtonContainer>
          <MobileButton onClick={toggleMenu}>
            {pageTitle}
            {toggleArrow}
          </MobileButton>
        </MobileButtonContainer>
        {nextLink}
      </Root>
    );
  }
};

export default MobileMenu;
