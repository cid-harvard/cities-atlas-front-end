import React from 'react';
import {Props} from '../sideNav';
import {
  Link,
  useHistory,
  matchPath,
} from 'react-router-dom';
import {
  PageArrowsContainer,
  breakPoints,
} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import {
  baseColor,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';

const ChevronSVG = raw('../../../assets/icons/chevron.svg');

const Root = styled(PageArrowsContainer)`
  display: flex;
  justify-content: center;

  @media ${breakPoints.small} {
    display: none;
  }
`;

const arrowStyles = `
  margin: 1rem 0.5rem;
  color: ${baseColor};
  text-decoration: none;
  border: solid 1px ${baseColor};
  pointer-events: auto;
`;

const ArrowBase = styled(Link)`
  ${arrowStyles}

  &:hover {
    color: #fff;
    background-color: ${baseColor};

    svg polyline {
      stroke: #fff;
    }
  }
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

const PrevSvg = styled(SvgBase)`
  svg {
    transform: rotate(180deg);
  }
`;

const PageChangeArrows = ({baseLinkData}: Props) => {
  const history = useHistory();

  if (baseLinkData.length === 0) {
    console.warn('PageChangeArrows component are recieving baseLinkData of length 0');
    return null;
  }

  const linkIndex = baseLinkData.findIndex(d => {
    const match = matchPath(history.location.pathname, d.url);
    return match && match.isExact ? true : false;
  });

  if (linkIndex === -1) {
    console.warn('URL did not match any links provided to PageChangeArrows component');
    return null;
  } else {
    const prevLink = linkIndex > 0 ? (
      <ArrowBase to={baseLinkData[linkIndex - 1].url}>
        <PrevSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </ArrowBase>
    ) : (
      <DisabledArrow>
        <PrevSvg dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </DisabledArrow>
    );
    const nextLink = linkIndex < baseLinkData.length - 1 ? (
      <ArrowBase to={baseLinkData[linkIndex + 1].url}>
        <SvgBase dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </ArrowBase>
    ) : (
      <DisabledArrow>
        <SvgBase dangerouslySetInnerHTML={{__html: ChevronSVG}} />
      </DisabledArrow>
    );
    return (
      <Root>
        {prevLink}
        {nextLink}
      </Root>
    );
  }
};

export default PageChangeArrows;
