import React from 'react';
import styled from 'styled-components/macro';
import SimpleLoader from './SimpleLoader';

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingBlock = () => (
  <LoadingOverlay>
    <SimpleLoader size={80} />
  </LoadingOverlay>
);

export default LoadingBlock;
