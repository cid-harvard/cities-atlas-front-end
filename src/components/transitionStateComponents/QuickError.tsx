import React from 'react';
import {backgroundMedium} from '../../styling/styleUtils';
import styled, {keyframes} from 'styled-components/macro';
import {rgba} from 'polished';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const Root = styled.div`
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  pointer-events: none;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 50;
`;

const Content = styled.div`
  background-color: ${rgba(backgroundMedium, 0.9)};
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  transform: scale(0.5);
  opacity: 0;
  animation: ${fadeIn} 0.2s ease-in-out 1 forwards;
  pointer-events: all;
  position: relative;
  max-width: 280px;
`;

const CloseButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 0.5rem;
  color: #333;
  position: absolute;
  top: 0;
  right: 0;
`;

interface Props {
  closeError: () => void;
  children: React.ReactNode;
  duration?: number;
}

const QuickError = (props: Props) => {
  const {closeError, duration, children} =props;

  setTimeout(closeError, duration ? duration : 3000);

  return (
    <Root>
      <Content>
        {children}
        <CloseButton onClick={closeError}>×</CloseButton>
      </Content>
    </Root>
  );
};

export default QuickError;
