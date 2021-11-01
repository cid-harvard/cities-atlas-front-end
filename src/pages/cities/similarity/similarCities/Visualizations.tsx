import React from 'react';
import styled from 'styled-components';
import useFluent from '../../../../hooks/useFluent';
import { breakPoints } from '../../../../styling/GlobalGrid';
import CitySearch from '../../../../components/navigation/secondaryHeader/CitySearch';
import {
  secondaryFont,
  SearchContainerLight,
} from '../../../../styling/styleUtils';
import SimilarCitiesMap from '../../../../components/dataViz/similarCitiesMap';

const Root = styled.div`
  grid-column: 2;

  @media ${breakPoints.small} {
    grid-column: 1;
  }
`;

const SearchContainer = styled(SearchContainerLight)`
  max-width: 800px;
  width: 100%;
  font-family: ${secondaryFont};
  margin-bottom: 1.5rem;

  .react-panel-search-search-bar-input {
    padding: 0.7rem 1rem;
    font-size: 1rem;
  }

  .react-panel-search-search-bar-search-icon {
    display: none;
  }

`;

const Visualizations = () => {
  const getString = useFluent();
  return (
    <Root>
      <SearchContainer>
        <CitySearch
          searchContainerWidth={'clamp(200px, 100vw, 400px)'}
        />
      </SearchContainer>
      <p>{getString('city-similarity-para-1')}</p>
      <SimilarCitiesMap />
    </Root>
  );
};

export default Visualizations;
