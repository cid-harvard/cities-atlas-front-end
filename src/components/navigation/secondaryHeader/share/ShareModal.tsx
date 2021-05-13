import React from 'react';
import Modal from '../../../standardModal';
import styled, {keyframes} from 'styled-components/macro';
import {
  baseColor,
  secondaryFont,
} from '../../../../styling/styleUtils';
// import useFluent from '../../../../hooks/useFluent';

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  background-color: #fff;
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: ${baseColor};
  height: 100%;
  padding: 2rem;

  @media screen and (max-height: 700px) {
    overflow: visible;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0.5rem;
  text-transform: uppercase;
  font-size: 1.25rem;
  font-family: ${secondaryFont};
  position: absolute;
  right: 0;
  top: 0;
`;

const SectionTitle = styled.div`
  font-size: 1.25rem;
  text-transform: uppercase;
`;

interface Props {
  onClose: () => void;
}

export default (props: Props) => {
  const {
    onClose,
  } = props;
  // const getString = useFluent();
  return (
    <Modal
      onClose={onClose}
      height='auto'
      width='400px'
    >
      <Root>
        <SectionTitle>
          Direct Link
        </SectionTitle>
        <SectionTitle>
          Social Media Sharing
        </SectionTitle>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Root>
    </Modal>
  );
};
