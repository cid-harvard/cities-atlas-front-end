import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import useFluent from '../../../hooks/useFluent';
import DataDisclaimer from '../../general/dataDisclaimer';
import {
  UtilityBarButtonBase,
  columnsToRowsBreakpoint,
  mediumSmallBreakpoint,
  SvgBase,
  Text,
} from '../Utils';
import screenfull from 'screenfull';

const shareIconSvg = raw('../../../assets/icons/share.svg');
const expandIconSvg = raw('../../../assets/icons/expand.svg');
const collapseIconSvg = raw('../../../assets/icons/collapse.svg');
const guideIconSvg = raw('../../../assets/icons/guide.svg');
const downloadImageIconSvg = raw('../../../assets/icons/image-download.svg');
const downloadDataIconSvg = raw('../../../assets/icons/download.svg');

const UtilityBarRoot = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    justify-content: space-around;
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

const secondaryHeaderUtilityBarId = 'secondaryHeaderUtilityBarId';

export const UtilityBarPortal = () => (
  <UtilityBarRoot
    id={secondaryHeaderUtilityBarId}
  />
);

export enum DownloadType {
  Image = 'image',
  Data = 'data',
}

interface Props {
  onDownloadImageButtonClick?: () => void;
  onDownloadDataButtonClick?: () => void;
}

const UtilityBar = (props: Props) => {
  const {
    onDownloadImageButtonClick, onDownloadDataButtonClick,
  } = props;
  const getString = useFluent();

  const secondaryHeaderUtilityBarContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isUtilityBarRendered, setIsUtilityBarRendered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(screenfull.isEnabled && screenfull.isFullscreen);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${secondaryHeaderUtilityBarId}`);
    if (node !== null) {
      secondaryHeaderUtilityBarContainerNodeRef.current = node;
      setIsUtilityBarRendered(true);
    }
  }, []);

  const downloadDataButton = onDownloadDataButtonClick ? (
    <UtilityBarButtonBase onClick={onDownloadDataButtonClick}>
      <SvgBase
        dangerouslySetInnerHTML={{__html: downloadDataIconSvg}}
      />
      <Text>
        {getString('global-ui-download-data')}
      </Text>
    </UtilityBarButtonBase>
  ) : null;

  const downloadImageButton = onDownloadImageButtonClick ? (
    <UtilityBarButtonBase onClick={onDownloadImageButtonClick}>
      <LargeSvg
        dangerouslySetInnerHTML={{__html: downloadImageIconSvg}}
      />
      <Text>
        {getString('global-ui-download-image')}
      </Text>
    </UtilityBarButtonBase>
  ) : null;

  const onFullScreenClick = () => {
    const onFullscreenClose = () => setIsFullscreen(false);
    if (screenfull.isEnabled) {
      if (!screenfull.isFullscreen) {
          screenfull.request().then(() => {
            setTimeout(() => {
              setIsFullscreen(true);
              if (screenfull.isEnabled) {
                screenfull.on('change', onFullscreenClose);
              }
            }, 200);
          });
      } else {
        // if (document.exitFullscreen && screenfull.isEnabled) {
          screenfull.exit();
          screenfull.off('change', onFullscreenClose);
          setIsFullscreen(false);
        // }
      }
    }
  };

  let content: React.ReactElement<any> | null;
  if (isUtilityBarRendered === true && secondaryHeaderUtilityBarContainerNodeRef.current !== null) {
    content = createPortal((
      <>
        <UtilityBarButtonBase>
          <SvgBase
            dangerouslySetInnerHTML={{__html: shareIconSvg}}
          />
          <Text>
            {getString('global-ui-share')}
          </Text>
        </UtilityBarButtonBase>
        <UtilityBarButtonBase
          onClick={onFullScreenClick}
        >
          <SvgBase
            dangerouslySetInnerHTML={{__html: !isFullscreen ? expandIconSvg : collapseIconSvg}}
          />
          <Text>
            {!isFullscreen ? getString('global-ui-expand') : getString('global-ui-exit')}
          </Text>
        </UtilityBarButtonBase>
        <UtilityBarButtonBase>
          <LargeSvg
            dangerouslySetInnerHTML={{__html: guideIconSvg}}
          />
          <Text>
            {getString('global-ui-guide')}
          </Text>
        </UtilityBarButtonBase>
        {downloadImageButton}
        {downloadDataButton}
        <DataDisclaimer />
      </>
    ), secondaryHeaderUtilityBarContainerNodeRef.current);
  } else {
    content = null;
  }

  return content;
};

export default UtilityBar;
