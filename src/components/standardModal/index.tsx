import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';

const overlayPortalContainerId = 'overlayPortalContainerId';

const overlayPortalZIndex = 3000;

export const OverlayPortal = () => (
  <div
    id={overlayPortalContainerId}
    style={{
      position: 'relative',
      zIndex: overlayPortalZIndex,
    }}
  />
);

export const mobileWidth = 600; // in px

const Root = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
`;

interface Dimensions {
  width: string;
  height: string;
}

const Container = styled.div<{dimensions: Dimensions}>`
  position: relative;
  max-height: 90%;
  max-width: ${({dimensions: {width}}) => width};
  height: ${({dimensions: {height}}) => height};

  @media(max-width: ${mobileWidth}px) {
    max-height: 100%;
    width: 90%;
    max-width: 100%;
    overflow: auto;
  }
`;

const Content = styled.div`
  overflow: auto;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, .1);
  }

  @media(max-width: ${mobileWidth}px) {
    overflow: visible;
    padding-bottom: 15vh;
  }
`;

export interface Props {
  children: React.ReactNode;
  onClose: () => void;
  width: string;
  height: string;
}

const Modal = (props: Props) => {
  const {
    children, onClose, width, height,
  } = props;

  const overlayPortalContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isModalRendered, setIsModalRendered] = useState<boolean>(false);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${overlayPortalContainerId}`);
    if (node !== null) {
      overlayPortalContainerNodeRef.current = node;
      setIsModalRendered(true);
    }
  }, []);

  let modal: React.ReactElement<any> | null;
  if (isModalRendered === true && overlayPortalContainerNodeRef.current !== null) {
    modal = createPortal((
      <Root>
        <Overlay onClick={onClose} />
        <Container dimensions={{width, height}}>
          <Content>
            {children}
          </Content>
        </Container>
      </Root>
    ), overlayPortalContainerNodeRef.current);
  } else {
    modal = null;
  }

  return modal;
};

export default Modal;
