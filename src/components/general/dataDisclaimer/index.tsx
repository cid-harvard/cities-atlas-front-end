import React, {useState} from 'react';
import styled, {keyframes} from 'styled-components/macro';
import {
  UtilityBarButtonBase,
  mediumSmallBreakpoint,
  SvgBase,
  Text,
} from '../../navigation/Utils';
import raw from 'raw.macro';
import {
  baseColor,
  secondaryFont,
  primaryColor,
  primaryHoverColor,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';
import useCurrentCity from '../../../hooks/useCurrentCity';
import {DataFlagType} from '../../../types/graphQL/graphQLTypes';
import Modal from '../../standardModal';
import {Link} from 'react-router-dom';
import {Routes} from '../../../routing/routes';

const dataIconSvg = raw('../../../assets/icons/disclaimer.svg');

const DisclaimerSvg = styled(SvgBase)<{$flagColor: string}>`
  width: 1.2rem;
  height: 1.2rem;

  svg {
    .cls-1 {
      fill: none;
      stroke: ${({$flagColor}) => $flagColor};
    }
    .cls-2 {
      fill: ${({$flagColor}) => $flagColor};
    }
    circle {
      fill: ${({$flagColor}) => $flagColor};
    }
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1rem;
    height: 1rem;
  }
`;

const DisclaimerSvgLarge = styled(DisclaimerSvg)`
  width: 2rem;
  height: 2rem;
  margin-right: 0.875rem;

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

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
  padding: 1rem 3rem 2rem;
  width: 600px;
  max-width: 100%;
  box-sizing: border-box;

  @media screen and (max-height: 800px) {
    overflow: visible;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  font-weight: 400;
  border-bottom: solid 1px ${baseColor};
  padding-bottom: 0.875rem;
`;

const Para = styled.p`
  font-size: 0.875rem;
  margin: 1rem 0;

  a {
    color: ${primaryColor};

    &:hover {
      color: ${primaryHoverColor};
    }
  }
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

const DataDisclaimer = () => {
  const getString = useFluent();
  const currentCity = useCurrentCity();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  let flagColor: string = baseColor;
  let alertTitle: string = '';
  let description: string = '';
  if (currentCity && currentCity.city) {
    const {dataFlag} = currentCity.city;
    if (dataFlag === DataFlagType.GREEN) {
      flagColor = '#008000';
      alertTitle = getString('data-disclaimer-green-title');
      description = getString('data-disclaimer-green-desc');
    } else if (dataFlag === DataFlagType.YELLOW) {
      flagColor = '#d69316';
      alertTitle = getString('data-disclaimer-yellow-title');
      description = getString('data-disclaimer-yellow-desc');
    } else if (dataFlag === DataFlagType.ORANGE) {
      flagColor = '#e66219';
      alertTitle = getString('data-disclaimer-orange-title');
      description = getString('data-disclaimer-orange-desc');
    } else if (dataFlag === DataFlagType.RED) {
      flagColor = '#e42020';
      alertTitle = getString('data-disclaimer-red-title');
      description = getString('data-disclaimer-red-desc');
    }
  }

  const modal = modalOpen ? (
    <Modal
      onClose={() => setModalOpen(false)}
      width={'600px'}
      height={'600px'}
    >
      <Root>
        <Title>
          <DisclaimerSvgLarge
            dangerouslySetInnerHTML={{__html: dataIconSvg}}
            $flagColor={flagColor}
          />
          {getString('global-ui-data-disclaimer')} - {alertTitle}
        </Title>
        <Para dangerouslySetInnerHTML={{__html: description}} />
        <Para>
          {getString('data-disclaimer-data-page-lead-up')}
          &nbsp;
          <Link to={Routes.DataAbout}>{getString('data-disclaimer-data-page-link-text')}</Link>
        </Para>
        <Para dangerouslySetInnerHTML={{__html: getString('data-disclaimer-contact')}} />
        <CloseButton onClick={() => setModalOpen(false)}>✕</CloseButton>
      </Root>
    </Modal>
  ) : null;

  return (
    <>
      <UtilityBarButtonBase
        onClick={() => setModalOpen(true)}
      >
        <DisclaimerSvg
          dangerouslySetInnerHTML={{__html: dataIconSvg}}
          $flagColor={flagColor}
        />
        <Text style={{color: flagColor}}>
          {getString('global-ui-data-disclaimer')}
        </Text>
      </UtilityBarButtonBase>
      {modal}
    </>
  );
};

export default DataDisclaimer;
