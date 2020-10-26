import React from 'react';
import styled from 'styled-components/macro';
import {ButtonBase} from '../Utils';
import raw from 'raw.macro';
import {
  baseColor,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';

const readThisChartIconSVG = raw('../../../assets/icons/read-this-chart.svg');

const ReadChartButton = styled(ButtonBase)`
  border: solid 1px ${baseColor};
  margin-right: 0.25rem;
`;

const HowToRead = () => {
  const getString = useFluent();

  return (
    <ReadChartButton>
      <span dangerouslySetInnerHTML={{__html: readThisChartIconSVG}} />
      {getString('global-ui-read-chart')}
    </ReadChartButton>
  );
};

export default HowToRead;
