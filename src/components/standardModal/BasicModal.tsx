import React from 'react';
import Modal, {Props} from './';
import styled from 'styled-components/macro';
import {lightBaseColor} from '../../styling/styleUtils';

const Root = styled.div`
  padding: 1rem;
  background-color: #fff;
  border-radius: 4px;
  position: relative;
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
