import React from 'react';
import Modal, {Props} from './';
import styled, {keyframes} from 'styled-components/macro';
import {
  backgroundDark,
  secondaryFont,
} from '../../styling/styleUtils';
import useFluent from '../../hooks/useFluent';

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  padding: 1.5rem;
  background-color: ${backgroundDark};
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: #fff;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0.5rem;
  color: #fff;
  text-transform: uppercase;
  font-size: 1.25rem;
  font-family: ${secondaryFont};
  position: absolute;
  right: 0;
  top: 0;
`;

export default (props: Props) => {
  const {children, ...rest} = props;
  const getString = useFluent();
  const closeButton = props.onClose
    ? <CloseButton onClick={props.onClose}>✕ {getString('global-ui-close')}</CloseButton>
    : null;
  return (
    <Modal {...rest}>
      <Root>
        {children}
        {closeButton}
      </Root>
    </Modal>
  );
};
