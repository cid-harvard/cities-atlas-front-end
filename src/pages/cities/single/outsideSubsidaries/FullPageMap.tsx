import React from 'react';
import SubsidiaryMap from '../../../../components/map/SubsidiaryMap';
import styled from 'styled-components/macro';
import {
  getBounds,
} from '../../../../components/map/Utils';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: auto;
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