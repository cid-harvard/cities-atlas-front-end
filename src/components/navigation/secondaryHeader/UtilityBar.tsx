import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import {
  secondaryFont,
  baseColor,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import useFluent from '../../../hooks/useFluent';

const mediumBreakpoint = 1180; // in px
const mediumSmallBreakpoint = 1050; // in px
export const columnsToRowsBreakpoint = 950; // in px
const smallBreakpoint = 550; // in px

const shareIconSvg = raw('../../../assets/icons/share.svg');
const expandIconSvg = raw('../../../assets/icons/expand.svg');
const guideIconSvg = raw('../../../assets/icons/guide.svg');
const downloadImageIconSvg = raw('../../../assets/icons/image-download.svg');
const downloadDataIconSvg = raw('../../../assets/icons/download.svg');
const dataIconSvg = raw('../../../assets/icons/disclaimer.svg');

const UtilityBarRoot = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    justify-content: space-around;
  }
`;

const ButtonBase = styled.button`
  border: none;
  margin: 0 0.25rem;
  padding: 0.35rem;
  background-color: transparent;
  font-size: clamp(0.65rem, 1vw, 0.85rem);
  font-family: ${secondaryFont};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  outline: 0 solid rgba(255, 255, 255, 0);
  transition: outline 0.1s ease;
  flex-shrink: 1;

  &:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }

  @media (max-width: ${mediumBreakpoint}px) {
    padding: 0.25rem;
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    flex-direction: column;
  }

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    flex-direction: row;
  }

  @media (max-width: ${smallBreakpoint}px) {
    flex-direction: column;
  }
`;

const SvgBase = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.3rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${baseColor};
    }
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    margin-right: 0;
    margin-bottom: 0.2rem;
  }

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    margin-right: 0.3rem;
    margin-bottom: 0;
  }

  @media (max-width: ${smallBreakpoint}px) {
    margin-right: 0;
    margin-bottom: 0.2rem;
  }
`;

const DisclaimerSvg = styled(SvgBase)`
  width: 1.2rem;
  height: 1.2rem;

  svg {
    .cls-1 {
      fill: none;
      stroke: ${baseColor};
    }
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1rem;
    height: 1rem;
  }
`;

const LargeSvg = styled(SvgBase)`
  width: 1.4rem;
  height: 1.4rem;

  @media (max-width: ${mediumSmallBreakpoint}px) {
    width: 1rem;
    height: 1rem;
  }
`;

const Text = styled.span`
  max-width: 80px;

  @media (max-width: 1100px) {
    max-width: 65px;
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    text-align: center;
  }
`;

const secondaryHeaderUtilityBarId = 'secondaryHeaderUtilityBarId';

export const UtilityBarPortal = () => (
  <UtilityBarRoot
    id={secondaryHeaderUtilityBarId}
  />
);

export enum ModalType {
  DownloadImage = 'downloadimage',
  DownloadData = 'downloaddata',
  Data = 'data',
  HowToRead = 'howtoread',
  Settings = 'settings',
}

interface Props {
  onDownloadImageButtonClick?: () => void;
  onDownloadDataButtonClick?: () => void;
  onDataButtonClick?: () => void;
}

const UtilityBar = (props: Props) => {
  const {
    onDownloadImageButtonClick, onDownloadDataButtonClick, onDataButtonClick,
  } = props;
  const getString = useFluent();

  const secondaryHeaderUtilityBarContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isUtilityBarRendered, setIsUtilityBarRendered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${secondaryHeaderUtilityBarId}`);
    if (node !== null) {
      secondaryHeaderUtilityBarContainerNodeRef.current = node;
      setIsUtilityBarRendered(true);
    }
  }, []);

  const downloadDataButton = onDownloadDataButtonClick ? (
    <ButtonBase onClick={onDownloadDataButtonClick}>
      <SvgBase
        dangerouslySetInnerHTML={{__html: downloadDataIconSvg}}
      />
      <Text>
        {getString('global-ui-download-data')}
      </Text>
    </ButtonBase>
  ) : null;

  const downloadImageButton = onDownloadImageButtonClick ? (
    <ButtonBase onClick={onDownloadImageButtonClick}>
      <LargeSvg
        dangerouslySetInnerHTML={{__html: downloadImageIconSvg}}
      />
      <Text>
        {getString('global-ui-download-image')}
      </Text>
    </ButtonBase>
  ) : null;


  const dataDisclaimerButton = onDataButtonClick ? (
    <ButtonBase onClick={onDataButtonClick}>
      <DisclaimerSvg
        dangerouslySetInnerHTML={{__html: dataIconSvg}}
      />
      <Text>
        {getString('global-ui-data-disclaimer')}
      </Text>
    </ButtonBase>
  ) : null;

  const onFullScreenClick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  let content: React.ReactElement<any> | null;
  if (isUtilityBarRendered === true && secondaryHeaderUtilityBarContainerNodeRef.current !== null) {
    content = createPortal((
      <>
        <ButtonBase>
          <SvgBase
            dangerouslySetInnerHTML={{__html: shareIconSvg}}
          />
          <Text>
            {getString('global-ui-share')}
          </Text>
        </ButtonBase>
        <ButtonBase
          onClick={onFullScreenClick}
        >
          <SvgBase
            dangerouslySetInnerHTML={{__html: expandIconSvg}}
          />
          <Text>
            {!isFullscreen ? getString('global-ui-expand') : getString('global-ui-exit')}
          </Text>
        </ButtonBase>
        <ButtonBase>
          <LargeSvg
            dangerouslySetInnerHTML={{__html: guideIconSvg}}
          />
          <Text>
            {getString('global-ui-guide')}
          </Text>
        </ButtonBase>
        {downloadImageButton}
        {downloadDataButton}
        {dataDisclaimerButton}
      </>
    ), secondaryHeaderUtilityBarContainerNodeRef.current);
  } else {
    content = null;
  }

  return content;
};

export default UtilityBar;
