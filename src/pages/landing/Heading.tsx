import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  primaryFont,
  secondaryFont,
  primaryColor,
} from '../../styling/styleUtils';
import raw from 'raw.macro';
import {
  citiesLogoSVG,
  cityIconSVG,
} from '../../components/navigation/header';
import useFluent from '../../hooks/useFluent';
import BasicModal from '../../components/standardModal/BasicModal';

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
  margin: 1rem 0;
  padding: 0 0 0.35rem 0;
  border-bottom: solid 0.3rem ${primaryColor};
  display: flex;
  align-items: flex-end;
  pointer-events: all;

  @media (max-width: 850px) {
    font-size: 1.2rem;
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

const WhatIsACityLinkContainer = styled.div`
  margin: 0 auto 1.1rem;
  display: block;
  width: 100%;

  @media (min-width: 990px) {
    width: 85%;
  }
`;

const WhatIsACityLink = styled.button`
  pointer-events: all;
  background-color: transparent;
  border: none;
  color: #fff;
  font-family: ${primaryFont};
  font-size: 0.85rem;
  padding: 0.5rem;
  border: solid 1px #fff;
  background-color: rgba(0,0,0,0.85);
  text-transform: uppercase;

  &:hover {
    background-color: #fff;
    color: #08111e;
  }
`;

export const ModalContent = styled.div`
  background-color: #08111e;
  padding: 3rem 1.75rem 1.75rem;

  strong {
    color: ${primaryColor};
    font-weight: 400;
  }

  a {
    color: #fff;
  }
`;

const Heading = () => {
  const getString = useFluent();
  const [cityModalOpen, setCityModalOpen] = useState<boolean>(false);
  const openModal = () => setCityModalOpen(true);
  const closeModal = () => setCityModalOpen(false);
  const modal = cityModalOpen ? (
    <BasicModal
      width={'400px'}
      height={'auto'}
      onClose={closeModal}
    >
      <ModalContent>
        <p
          dangerouslySetInnerHTML={{__html: getString('landing-page-text-what-is-city-para-1')}}
        />
        <p
          dangerouslySetInnerHTML={{__html: getString('landing-page-text-what-is-city-para-2')}}
        />
      </ModalContent>
    </BasicModal>
  ) : null;
  return (
    <Root>
      <Logo
        dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
        aria-label={getString('global-app-name')}
      />
      <H2>
        <CityIcon
          dangerouslySetInnerHTML={{__html: cityIconSVG}}
        />
        {getString('navigation-pick-a-city')}
      </H2>
      <Description>
        <span>{getString('global-ui-type-a-city-name')}</span>
        <Or>{getString('landing-page-text-or')}</Or>
        <UseMapText>
          <MapPanIcon
            dangerouslySetInnerHTML={{__html: mapPanSVG}}
          />
          {getString('landing-page-text-use-the-map')}
        </UseMapText>
      </Description>
      <WhatIsACityLinkContainer>
        <WhatIsACityLink onClick={openModal}>
          {getString('landing-page-text-what-is-city-link')}
        </WhatIsACityLink>
      </WhatIsACityLinkContainer>
      {modal}
    </Root>
  );
};

export default Heading;
