import React from 'react';
import styled from 'styled-components/macro';
import {
  UtilityBarButtonBase,
  mediumSmallBreakpoint,
  SvgBase,
  Text,
} from '../../navigation/Utils';
import raw from 'raw.macro';
import {
  baseColor,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';

const dataIconSvg = raw('../../../assets/icons/disclaimer.svg');

const DisclaimerSvg = styled(SvgBase)`
  width: 1.2rem;
  height: 1.2rem;

  svg {
    .cls-1 {
      fill: none;
      stroke: ${baseColor};
    }
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1rem;
    height: 1rem;
  }
`;

const DataDisclaimer = () => {
  const getString = useFluent();

  return (
    <UtilityBarButtonBase>
      <DisclaimerSvg
        dangerouslySetInnerHTML={{__html: dataIconSvg}}
      />
      <Text>
        {getString('global-ui-data-disclaimer')}
      </Text>
    </UtilityBarButtonBase>
  );
};

export default DataDisclaimer;
