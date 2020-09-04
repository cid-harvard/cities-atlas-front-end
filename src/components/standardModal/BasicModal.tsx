import React from 'react';
import Modal, {Props} from './';
import styled, {keyframes} from 'styled-components/macro';
import {lightBaseColor} from '../../styling/styleUtils';

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  padding: 1rem;
  background-color: #fff;
  border-radius: 4px;
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0.5rem;
  color: ${lightBaseColor};
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.85rem;
`;

export default (props: Props) => {
  const {children, ...rest} = props;
  return (
    <Modal {...rest}>
      <Root>
        {children}
        <CloseButton onClick={props.onClose}>✕</CloseButton>
      </Root>
    </Modal>
  );
};
