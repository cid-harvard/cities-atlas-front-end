import React from 'react';
import styled from 'styled-components/macro';
import {rgba} from 'polished';
import {
  secondaryFont,
} from '../../styling/styleUtils';
import {
  citiesLogoSVG,
  cityIconSVG,
} from '../../components/navigation/header';
import useFluent from '../../hooks/useFluent';
import GrowthLabLogoPNG from '../../assets/branding/growth-lab-logo.png';

const Root = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
`;

const Content = styled.div`
  padding: 1rem;
  background-color: ${rgba('#08111e', 0.9)};
  pointer-events: all;
  color: #fff;
  display: grid;
  grid-template-areas:
    "gl logo ."
    "p p p"
    ". click .";
  grid-template-columns: 1fr auto 1fr;
  grid-row-gap: 1.75rem;
  max-width: 700px;
  max-height: 100%;
  overflow: auto;
`;

const GrowthLabLogo = styled.div`
  grid-area: gl;
  position: relative;

  img {
    width: 170px;
    max-width: 100%;
    min-width: 90px;
    @media (max-width: 600px) {
      position: absolute;
      min-width: 120px;
      top: -1rem;
    }
  }
`;

const CityverseLogo = styled.div`
  grid-area: logo;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h1`
  margin: 3rem 3rem 0;
  width: 13.75rem;
  height: 3rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }
`;

const TitleSubtext = styled.h2`
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
  text-transform: none;
`;

const IntroP = styled.div`
  grid-area: p;
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0 3rem 2rem;
  opacity: 0.8;
`;

const StartButtons = styled.div`
  grid-area: click;
  font-family: ${secondaryFont};
  font-size: 1.2rem;
  text-transform: uppercase;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PickCityButton = styled.button`
  font-family: ${secondaryFont};
  font-size: 1.2rem;
  text-transform: uppercase;
  color: #fff;
  border: solid 1px #fff;
  background-color: transparent;
  padding: 0.875rem;
  margin: 1.25rem 0 3rem;
  display: flex;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;

    path,
    rect {
      fill: #fff;
    }
  }

  &:hover {
    cursor: pointer;
    color: #08111e;
    background-color: #fff;

    svg {
      path,
      rect {
        fill: #08111e;
      }
    }
  }
`;

const CityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  margin-right: 0.45rem;
`;

interface Props {
  onCitySelect: () => void;
}

const Overlay = ({onCitySelect}: Props) => {
  const getString = useFluent();

  return (
    <Root>
      <Content>
        <GrowthLabLogo>
          <a
            href='https://growthlab.cid.harvard.edu/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img
              src={GrowthLabLogoPNG}
              aria-label={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
              title={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
              alt={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
            />
          </a>
        </GrowthLabLogo>
        <CityverseLogo>
          <Logo
            dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
            aria-label={getString('global-app-name')}
          />
          <TitleSubtext>
            Growth Lab's City Economy Navigator
          </TitleSubtext>
        </CityverseLogo>
        <IntroP>
          {/* eslint-disable-next-line */}
          {'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'}
        </IntroP>
        <StartButtons>
          To Start
          <PickCityButton onClick={onCitySelect}>
            <CityIcon
              dangerouslySetInnerHTML={{__html: cityIconSVG}}
            />
            Pick a city
          </PickCityButton>
        </StartButtons>
      </Content>
    </Root>
  );
};

export default Overlay;
