import React, {useEffect, useRef, useState, useContext} from 'react';
import { createPortal } from 'react-dom';
import {
  secondaryFont,
  baseColor,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import AppContext from '../../../contextProviders/appContext';
import useFluent from '../../../hooks/useFluent';

const mediumBreakpoint = 1180; // in px
const mediumSmallBreakpoint = 1050; // in px
const textBreakpoint = 840; // in px
const smallBreakpoint = 550; // in px

const downloadIconSvg = raw('../../../assets/icons/download.svg');
const dataIconSvg = raw('../../../assets/icons/warning.svg');
const settingsIconSvg = raw('../../../assets/icons/settings.svg');

const UtilityBarRoot = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonBase = styled.button`
  border: none;
  margin: 0 0.25rem;
  padding: 0.35rem;
  background-color: transparent;
  font-size: 0.85rem;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  outline: 0 solid rgba(255, 255, 255, 0);
  transition: outline 0.1s ease;

  &:hover {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }

  @media (max-width: ${mediumBreakpoint}px) {
    font-size: 0.75rem;
    padding: 0.25rem;
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    flex-direction: column;
  }
`;

const SettingsButton = styled(ButtonBase)`
  font-size: 1rem;

  @media (max-width: ${mediumBreakpoint}px) {
    font-size: 0.75rem;
  }
`;

const segmentBorder = `solid 1px ${baseColor}`;

const SegmentContainer = styled.div<{$hasSettings: boolean}>`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1rem;
  border-left: ${segmentBorder};
  ${({$hasSettings}) => $hasSettings ? 'border-right:' + segmentBorder + ';' : ''}
  ${({$hasSettings}) => $hasSettings ? 'margin-right: 1rem;' : ''}

  @media (max-width: ${mediumBreakpoint}px) {
    padding: 0 0.5rem;
    ${({$hasSettings}) => $hasSettings ? 'margin-right: 0.5rem;' : ''}
  }

  @media (max-width: ${smallBreakpoint}px) {
    border-right: none;
    margin-right: 0;
    padding-right: 0;
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
`;

const Text = styled.span`
  @media (max-width: ${smallBreakpoint}px) {
    display: none;
  }
`;

const secondaryHeaderUtilityBarId = 'secondaryHeaderUtilityBarId';

export const UtilityBarPortal = () => (
  <UtilityBarRoot
    id={secondaryHeaderUtilityBarId}
  />
);

export enum ModalType {
  Download = 'download',
  Data = 'data',
  Settings = 'settings',
}

interface Props {
  onDownloadButtonClick?: () => void;
  onDataButtonClick?: () => void;
  onSettingsButtonClick?: () => void;
}

const UtilityBar = (props: Props) => {
  const {
    onDownloadButtonClick, onDataButtonClick, onSettingsButtonClick,
  } = props;
  const {windowDimensions} = useContext(AppContext);
  const getString = useFluent();

  const secondaryHeaderUtilityBarContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isUtilityBarRendered, setIsUtilityBarRendered] = useState<boolean>(false);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${secondaryHeaderUtilityBarId}`);
    if (node !== null) {
      secondaryHeaderUtilityBarContainerNodeRef.current = node;
      setIsUtilityBarRendered(true);
    }
  }, []);

  const downloadButton = onDownloadButtonClick ? (
    <ButtonBase onClick={onDownloadButtonClick}>
      <SvgBase
        dangerouslySetInnerHTML={{__html: downloadIconSvg}}
      />
      <Text>
        {getString('global-ui-download')}
      </Text>
    </ButtonBase>
  ) : null;

  const dataText = windowDimensions.width > textBreakpoint
    ? getString('global-ui-data-disclaimer')
    : getString('global-ui-data-notes');

  const dataButton = onDataButtonClick ? (
    <ButtonBase onClick={onDataButtonClick}>
      <SvgBase
        dangerouslySetInnerHTML={{__html: dataIconSvg}}
      />
      <Text>
        {dataText}
      </Text>
    </ButtonBase>
  ) : null;

  const settingsText = windowDimensions.width > textBreakpoint
    ? getString('global-ui-visualization-settings')
    : getString('global-ui-settings');

  const settingsButton = onSettingsButtonClick ? (
    <SettingsButton onClick={onSettingsButtonClick}>
      <SvgBase
        dangerouslySetInnerHTML={{__html: settingsIconSvg}}
      />
      <Text>
        {settingsText}
      </Text>
    </SettingsButton>
  ) : null;

  const downloadAndDataSegment = downloadButton || dataButton ? (
    <SegmentContainer
      $hasSettings={settingsButton ? true : false}
    >
      {downloadButton}
      {dataButton}
    </SegmentContainer>
  ) : null;



  let content: React.ReactElement<any> | null;
  if (isUtilityBarRendered === true && secondaryHeaderUtilityBarContainerNodeRef.current !== null) {
    content = createPortal((
      <>
        {downloadAndDataSegment}
        {settingsButton}
      </>
    ), secondaryHeaderUtilityBarContainerNodeRef.current);
  } else {
    content = null;
  }

  return content;
};

export default UtilityBar;
