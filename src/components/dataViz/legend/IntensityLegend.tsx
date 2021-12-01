import React from 'react';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import {intensityColorRange} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';
import {joyrideClassNames} from '../../navigation/secondaryHeader/guide/CitiesGuide';

const RootBase = styled.div`
  grid-row: 3;

  @media ${breakPoints.small} {
    grid-row: 4;
  }
`;

const StandardRoot = styled(RootBase)`
  grid-column: 1;

  @media (max-width: 1200px) {
    grid-column: 1 / -1;
  }
`;

const FullWidthRoot = styled(RootBase)`
  grid-column: 1 / -1;
`;

const Content = styled.div`
  padding: 0.875rem 0;
`;

const Bar = styled.div`
  width: 100%;
  height: 0.6rem;
  background: linear-gradient(90deg, ${intensityColorRange[0]} 0%, ${intensityColorRange[1]} 100%);
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  fullWidth?: boolean;
}

const IntensityLegend = (props: Props) => {
  const {fullWidth} = props;
  const Root = fullWidth ? FullWidthRoot : StandardRoot;
  const getString = useFluent();

  return (
    <Root className={joyrideClassNames.colorLegendNoFilter}>
      <Content>
        <Labels>
          <Label>{getString('global-intensity-low')}</Label>
          <Label>{getString('global-intensity-high')}</Label>
        </Labels>
        <Bar />
      </Content>
    </Root>
  );
};

export default IntensityLegend;
