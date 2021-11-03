import React, {useRef, useEffect} from 'react';
import {
  ExtendedSearchDatum,
  StyledPopup,
  TootltipTitle,
} from './Utils';
import styled from 'styled-components/macro';
import {Link} from 'react-router-dom';
import {CityRoutes} from '../../routing/routes';
import {createRoute} from '../../routing/Utils';
import {
  secondaryColor,
  secondaryFont,
} from '../../styling/styleUtils';
import useFluent from '../../hooks/useFluent';
import googleAnalyticsEvent from '../../components/analytics/googleAnalyticsEvent';

const Title = styled(TootltipTitle)`
  padding-bottom: 0.75rem;
  border-bottom: solid 1px #fff;
  margin: 0 0 1.25rem;
`;

const ReviewCityButton = styled(Link)`
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 0.95rem;
  display: block;
  width: 14rem;
  margin: 1rem auto 0;
  padding: 0.5rem;
  display: block;
  box-sizing: border-box;
  text-align: center;
  border: solid 1px #fff;
  color: #fff;
  box-shadow: none;
  transition: all 0.2s ease;
  transform-origin: top;
  pointer-events: all;
  text-decoration: none;

  &:hover {
    background-color: #fff;
    color: ${secondaryColor};
  }
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

enum Action {
  Profiles = 'Clicked City Profiles',
  Similarity = 'Clicked City Similarity',
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
  const triggerGoogleAnalyticsEvent = (action: Action) => () => googleAnalyticsEvent('Landing Page Map', action, `for ${highlighted.title}`);
  return (
    <StyledPopup
      coordinates={highlighted.center}
    >
      <Title>
        {highlighted.title}
      </Title>
      <ReviewCityButton
        ref={anchorRef}
        to={createRoute.city(CityRoutes.CityBase, highlighted.id.toString())}
        onClick={triggerGoogleAnalyticsEvent(Action.Profiles)}
      >
        {getString('landing-page-text-review-the-city')}
      </ReviewCityButton>
      <ReviewCityButton
        to={createRoute.city(CityRoutes.CitySimilarCities, highlighted.id.toString())}
        onClick={triggerGoogleAnalyticsEvent(Action.Similarity)}
      >
        {getString('landing-page-text-review-similar-cities')}
      </ReviewCityButton>
      <CloseTooltipButton onClick={closePopup}>×</CloseTooltipButton>
    </StyledPopup>
  );
};

export default HighlightedTooltip;
