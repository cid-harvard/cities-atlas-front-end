import React, {useState} from 'react';
import {textClassName, ExpandingButton} from '../Utils';
import raw from 'raw.macro';
import useFluent from '../../../hooks/useFluent';
import {joyrideClassNames} from '../../navigation/secondaryHeader/guide/CitiesGuide';
import {useRouteMatch} from 'react-router-dom';
import {Routes} from '../../../routing/routes';
import useQueryParams from '../../../hooks/useQueryParams';
import styled, {keyframes} from 'styled-components/macro';
import {
  baseColor,
  secondaryFont,
} from '../../../styling/styleUtils';
import Modal from '../../standardModal';
import TreemapPNG from './static/treemap.png';
import GoodAtPNG from './static/relative_presence.png';
import SimilarCityPNG from './static/similar_city.png';
import IndustrySpacePNG from './static/industry_space.png';
import SwotPNG from './static/swot.png';

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  background-color: #fff;
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: ${baseColor};
  height: 100%;
  padding: 0;
  width: 1000px;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    width: 900px;
  }

  @media (max-width: 950px) {
    width: 750px;
  }

  @media (max-width: 800px) {
    width: 550px;
  }

  @media screen and (max-height: 700px) {
    overflow: visible;
  }
`;

const Image = styled.img`
  width: 1000px;
  max-width: 100%;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0 0.5rem;
  color: ${baseColor};
  text-transform: uppercase;
  font-size: 1.5rem;
  font-family: ${secondaryFont};
  position: absolute;
  right: 0;
  top: 0;
`;

const readThisChartIconSVG = raw('../../../assets/icons/read-this-chart.svg');

const HowToRead = () => {
  const getString = useFluent();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const {compare_city} = useQueryParams();
  const isTreemap = useRouteMatch(Routes.CityEconomicComposition);
  const isGoodAt = useRouteMatch(Routes.CityGoodAt);
  const isSimilarCities = useRouteMatch(Routes.CitySimilarCities);
  const isIndustrySpace = useRouteMatch(Routes.CityIndustrySpacePosition);
  const isSwot = useRouteMatch(Routes.CityGrowthOpportunities);

  let source: string | undefined;
  if (isTreemap && isTreemap.isExact && !compare_city) {
    source = TreemapPNG;
  }
  else if (isGoodAt && isGoodAt.isExact) {
    source = GoodAtPNG;
  }
  else if (isSimilarCities && isSimilarCities.isExact) {
    source = SimilarCityPNG;
  }
  else if (isIndustrySpace && isIndustrySpace.isExact) {
    source = IndustrySpacePNG;
  }
  else if (isSwot && isSwot.isExact) {
    source = SwotPNG;
  }

  if (source) {
    const modal = modalOpen ? (
      <Modal
        onClose={() => setModalOpen(false)}
        width={'auto'}
        height={'auto'}
      >
        <Root>
          <Image
            src={source}
          />
          <CloseButton onClick={() => setModalOpen(false)}>✕</CloseButton>
        </Root>
      </Modal>
    ) : null;

    return (
      <>
        <ExpandingButton
          className={joyrideClassNames.howToRead}
          onClick={() => setModalOpen(true)}
        >
          <span dangerouslySetInnerHTML={{__html: readThisChartIconSVG}} />
          <div className={textClassName}>{getString('global-ui-read-chart')}</div>
        </ExpandingButton>
        {modal}
      </>
    );
  }
  return null;
};

export default HowToRead;
