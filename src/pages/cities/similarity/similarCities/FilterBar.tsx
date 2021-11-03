import React from 'react';
import styled from 'styled-components';
import { baseColor, lightBorderColor, secondaryFont } from '../../../../styling/styleUtils';
import { filterBarId } from '../../../../components/dataViz/similarCitiesMap/FilterBar';
import Settings from './Settings';
import useFluent from '../../../../hooks/useFluent';
import NodeSizeLegend from './NodeSizeLegend';
import { breakPoints } from '../../../../styling/GlobalGrid';

const Root = styled.div`
  grid-column: 1;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
  }
`;

const Content = styled.div`
  position: sticky;
  top: 1rem;
  height: 100vh;
  padding: 0 1rem 2rem 0;
  box-sizing: border-box;

  @media ${breakPoints.small} {
    height: auto;
  }
`;

  const ScrollContainer = styled.div`
  height: 100%;
  overflow: auto;
  background-color: ${lightBorderColor};
`;

const Divider = styled.div`
  margin: 0.75rem;
  border-top: solid 1px ${baseColor};
`;

const SectionTitle = styled.h2`
  padding: 0 0.75rem;
  font-family: ${secondaryFont};
`;

const FilterBar = () => {
  const getString = useFluent();
  return (
    <Root>
      <Content>
        <ScrollContainer>
          <SectionTitle>{getString('city-filter-title')}</SectionTitle>
          <div id={filterBarId} />
          <Divider />
          <SectionTitle>{getString('global-ui-node-size')}</SectionTitle>
          <Settings />
          <NodeSizeLegend />
        </ScrollContainer>
      </Content>
    </Root>
  );
};

export default FilterBar;
