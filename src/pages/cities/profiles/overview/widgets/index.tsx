import React from 'react';
import styled from 'styled-components';
import { breakPoints } from '../../../../../styling/GlobalGrid';
import TopRow from './topRow';
import BottomRow from './bottomRow';
import useCurrentCity from '../../../../../hooks/useCurrentCity';
import DisclaimerText from './DisclaimerText';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;

  @media (max-width: 1200px), (max-height: 800px) {
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


const Widgets = () => {
  const { city } = useCurrentCity();
  const disclaimer = city ? (
    <DisclaimerText
      cityId={city.cityId}
      regionId={city.region}
    />
  ) : null;
  return (
    <Root>
      <Row>
        <TopRow />
      </Row>
      <Row>
        <BottomRow />
      </Row>
      <Row>
        {disclaimer}
      </Row>
    </Root>
  );
};

export default Widgets;
