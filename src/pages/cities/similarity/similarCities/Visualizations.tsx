import React from 'react';
import styled from 'styled-components';
import useFluent from '../../../../hooks/useFluent';
import { breakPoints } from '../../../../styling/GlobalGrid';
import SimilarCitiesMap from '../../../../components/dataViz/similarCitiesMap';
import Header from './Header';

const Root = styled.div`
  grid-column: 2;

  @media ${breakPoints.small} {
    grid-column: 1;
  }
`;

const Visualizations = () => {
  const getString = useFluent();
  return (
    <Root>
      <Header />
      <p>{getString('city-similarity-para-1')}</p>
      <SimilarCitiesMap />
    </Root>
  );
};

export default Visualizations;
