import React from 'react';
import styled from 'styled-components';
import { lightBorderColor } from '../../../../styling/styleUtils';
import { filterBarId } from '../../../../components/dataViz/similarCitiesMap/FilterBar';

const Root = styled.div`
  grid-column: 1;
  position: relative;
`;

const Content = styled.div`
  position: sticky;
  top: 1rem;
  height: 100vh;
  padding: 0 1rem 2rem 0;
  box-sizing: border-box;
  `;

  const ScrollContainer = styled.div`
  height: 100%;
  overflow: auto;
  background-color: ${lightBorderColor};
`;

const FilterBar = () => {
  return (
    <Root>
      <Content>
        <ScrollContainer>
          <div id={filterBarId} />
        </ScrollContainer>
      </Content>
    </Root>
  );
};

export default FilterBar;
