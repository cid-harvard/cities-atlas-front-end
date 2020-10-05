import React from 'react';
import styled from 'styled-components/macro';
import useFluent from '../../hooks/useFluent';
import {
  primaryFont,
  sectorColorMap,
} from '../../styling/styleUtils';

const Root = styled.div`
  grid-row: 3;
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 1rem 0 0;
`;

const Sector = styled.button`
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  margin: 0.1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-family: ${primaryFont};
`;

const Block = styled.div`
  width: 0.7rem;
  height: 0.7rem;
  margin-right: 0.2rem;
`;

const SectorLabels = () => {
  const getString = useFluent();
  const sectors = sectorColorMap.map(({id, color}) => {
    return (
      <Sector key={'sector-label-' + id}>
        <Block style={{backgroundColor: color}} />
        {getString('global-naics-sector-name-' + id)}
      </Sector>
    );
  });

  return (
    <Root>
      {sectors}
    </Root>
  );
};

export default SectorLabels;
