import React from 'react';
import {lightBaseColor} from '../../styling/styleUtils';
import styled, {keyframes} from 'styled-components/macro';

const Spinner = styled.div`
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const bounceDelay = keyframes`
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
`;

const Bounce = styled.div`
  width: 0.6rem;
  height: 0.6rem;
  margin: 0 0.25rem 0;
  background-color: ${lightBaseColor};
  border-radius: 100%;
  display: inline-block;
  animation: ${bounceDelay} 1.4s infinite ease-in-out both;
`;

const Bounce1 = styled(Bounce)`
  animation-delay: -0.32s;
`;

const Bounce2 = styled(Bounce)`
  animation-delay: -0.16s;
`;

export default () => {
  return (
    <Spinner>
      <Bounce1 />
      <Bounce2 />
      <Bounce />
    </Spinner>
  );
};