import React, {useRef, useEffect} from 'react';
import {
  ExtendedSearchDatum,
  StyledPopup,
  TootltipTitle,
} from './Utils';
import styled, {keyframes} from 'styled-components/macro';
import {numberWithCommas} from '../../Utils';
import {Link} from 'react-router-dom';
import {CityRoutes} from '../../routing/routes';
import {createRoute} from '../../routing/Utils';
import {
  secondaryColor,
  secondaryFont,
} from '../../styling/styleUtils';
import useFluent from '../../hooks/useFluent';

const bounceRight = keyframes`
  0%,
  20%,
  50%,
  80%,
  100% {
    left: 0;
  }

  40% {
    left: 0.7rem;
  }

  60% {
    left: 0.3rem;
  }
`;

const bounceDuration = '1'; // in seconds


const TootlipContent = styled.p`
  color: #fff;
  font-size: 0.85rem;
  text-align: center;
  margin: 1rem 0;
  line-height: 1.7;
`;

const ReviewCityButton = styled(Link)`
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 1.1rem;
  display: block;
  width: 100%;
  padding: 0.7rem;
  display: block;
  box-sizing: border-box;
  background-color: #fff;
  text-align: center;
  color: ${secondaryColor};
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
  transform-origin: top;
  pointer-events: all;
  text-decoration: none;

  &:hover {
    transform: scale(1.1);

    span {
      animation: ${bounceRight} ${bounceDuration}s ease-in-out infinite;
    }
  }
`;

const Arrow = styled.span`
  font-family: Verdana, sans-serif;
  font-size: 1.5rem;
  line-height: 0;
  position: relative;
  top: 0.2rem;
`;

const CloseTooltipButton = styled.button`
  position: absolute;
  font-size: 1rem;
  top: 0;
  right: 0;
  padding: 0.2rem;
  color: #fff;
  background-color: transparent;
  border: none;
  box-shadow: none;
  pointer-events: all;
`;

interface Props {
  highlighted: ExtendedSearchDatum;
  closePopup: () => void;
}

const HighlightedTooltip = (props: Props) => {
  const {highlighted, closePopup} = props;
  const getString = useFluent();
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const node = anchorRef.current;
    if (node) {
      node.focus();
    }
  }, [anchorRef]);
  return (
    <StyledPopup
      coordinates={highlighted.center}
    >
      <TootltipTitle>
        {highlighted.title}
      </TootltipTitle>
      <TootlipContent>
        {getString('global-text-population')} (2015): {numberWithCommas(highlighted.population)}
        <br />
        {getString('global-text-gdp-per-capita')} (2015): ${numberWithCommas(highlighted.gdp.toFixed(2))}
      </TootlipContent>
      <ReviewCityButton
        ref={anchorRef}
        to={createRoute.city(CityRoutes.CityBase, highlighted.id.toString())}
      >
        {getString('landing-page-text-review-the-city')} <Arrow>→</Arrow>
      </ReviewCityButton>
      <CloseTooltipButton onClick={closePopup}>×</CloseTooltipButton>
    </StyledPopup>
  );
};

export default HighlightedTooltip;
