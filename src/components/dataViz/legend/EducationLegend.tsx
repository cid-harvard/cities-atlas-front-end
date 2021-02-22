import React from 'react';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import {educationColorRange} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';

const RootBase = styled.div`
  grid-row: 3;

  @media ${breakPoints.small} {
    grid-row: 4;
  }
`;

const StandardRoot = styled(RootBase)`
  grid-column: 1;
`;

const FullWidthRoot = styled(RootBase)`
  grid-column: 1 / -1;
`;

const Content = styled.div`
  padding: 1rem 0 2rem;
`;

const Bar = styled.div`
  width: 100%;
  height: 0.65rem;
  background: linear-gradient(90deg, ${educationColorRange[0]} 0%, ${educationColorRange[1]} 100%);
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
`;

interface Props {
  fullWidth?: boolean;
}

const IntensityLegend = (props: Props) => {
  const {fullWidth} = props;
  const Root = fullWidth ? FullWidthRoot : StandardRoot;
  const getString = useFluent();

  return (
    <Root>
      <Content>
        <Labels>
          <div>{getString('global-education-low')}</div>
          <div>{getString('global-education-high')}</div>
        </Labels>
        <Bar />
      </Content>
    </Root>
  );
};

export default IntensityLegend;
