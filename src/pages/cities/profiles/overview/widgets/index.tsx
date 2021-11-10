import React from 'react';
import styled from 'styled-components';
import { breakPoints } from '../../../../../styling/GlobalGrid';
import TopRow from './topRow';
import BottomRow from './bottomRow';
import useFluent from '../../../../../hooks/useFluent';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;

  @media (max-width: 1200px) {
    gap: 0.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  @media ${breakPoints.small} {
    flex-direction: column;
  }
`;

const DisclaimerText = styled.small`
  text-align: center;
  font-size: 0.65rem;
  width: 100%;
  display: block;
`;

const Widgets = () => {
  const getString = useFluent();

  return (
    <Root>
      <Row>
        <TopRow />
      </Row>
      <Row>
        <BottomRow />
      </Row>
      <Row>
        <DisclaimerText>*{getString('city-overview-benchmark-disclaimer')}</DisclaimerText>
      </Row>
    </Root>
  );
};

export default Widgets;
