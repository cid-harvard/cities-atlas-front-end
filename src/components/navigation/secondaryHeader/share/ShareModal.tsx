import React, {useState} from 'react';
import Modal from '../../../standardModal';
import styled, {keyframes} from 'styled-components/macro';
import {
  baseColor,
  secondaryFont,
  primaryFont,
} from '../../../../styling/styleUtils';
// import useFluent from '../../../../hooks/useFluent';
import raw from 'raw.macro';

const iconGray = '#2D363F';

const linkSvg = raw('../../../templates/informationalPage/assets/link.svg');

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
  margin-bottom: 0.75rem;
  font-family: ${primaryFont};
`;

const SvgBase = styled.div`
  svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${iconGray};
    }
  }
`;

const CopyUrlBar = styled.div`
  min-height: 1rem;
  max-width: 450px;
  white-space: nowrap;
  display: grid;
  grid-template-columns: 1.45rem 1fr auto;
  background-color: lightgray;
  margin-bottom: 2rem;
  cursor: pointer;
`;

const CopyIcon = styled(SvgBase)`
  padding-left: 0.45rem;
`;

const UrlText = styled.div`
  overflow: hidden;
  padding: 0.45rem 0.55rem;
`;

const CopyButton = styled.button`
  font-family: ${primaryFont};
  text-transform: uppercase;
  padding: 0.45rem 0.75rem;
  background-color: ${iconGray};
  color: #fff;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
`;

interface Props {
  onClose: () => void;
}

export default (props: Props) => {
  const {
    onClose,
  } = props;
  // const getString = useFluent();
  const [copied, setCopied] = useState<boolean>(false);
  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };
  const copyText = copied ? 'Copied' : 'Copy';
  return (
    <Modal
      onClose={onClose}
      height='auto'
      width='500px'
    >
      <Root>
        <SectionTitle>
          Direct Link
        </SectionTitle>
        <CopyUrlBar>
          <CopyIcon
            dangerouslySetInnerHTML={{__html: linkSvg}}
          />
          <UrlText>
            {window.location.href}
          </UrlText>
          <CopyButton onClick={onCopy}>
            {copyText}
          </CopyButton>
        </CopyUrlBar>
        <SectionTitle>
          Social Media Sharing
        </SectionTitle>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Root>
    </Modal>
  );
};
