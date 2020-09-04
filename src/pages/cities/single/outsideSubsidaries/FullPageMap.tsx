import React from 'react';
import SubsidiaryMap from '../../../../components/map/SubsidiaryMap';
import styled from 'styled-components/macro';
import {
  getBounds,
} from '../../../../components/map/Utils';
import { breakPoints } from '../../../../styling/GlobalGrid';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: auto;

  @media ${breakPoints.small} {
    position: relative;
    box-sizing: border-box;
    padding: 1rem;
    width: 100%;
    height: 60vh;
  }
`;

const FullPageMap = () => {
  return (
    <Root>
      <SubsidiaryMap
        fitBounds={getBounds([])}
      />
    </Root>
  );
};

export default FullPageMap;