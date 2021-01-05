import React from 'react';
import styled, {keyframes} from 'styled-components/macro';
import {
  useHistory,
} from 'react-router-dom';
import queryString from 'query-string';
import useQueryParams from '../../../hooks/useQueryParams';
import useFluent from '../../../hooks/useFluent';
import {
  secondaryFont,
  backgroundDark,
  primaryColorLight,
  BlockButton,
  BlockButtonHighlighted,
} from '../../../styling/styleUtils';
import {
  CompositionType,
  defaultDigitLevel,
  defaultCompositionType,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {breakPoints} from '../../../styling/GlobalGrid';
import {Toggle} from '../../../routing/routes';
import raw from 'raw.macro';
import Tooltip from '../../general/Tooltip';

const gearIcon = raw('../../../assets/icons/settings.svg');

const slideIn = keyframes`
  0% {
    transform: translate(100%, 0);
  }

  75% {
    transform: translate(-8%, 0);
  }

  90% {
    transform: translate(5, 0);
  }

  100% {
    transform: translate(0, 0);
  }
`;

const Root = styled.div`
  grid-column: 2;
  grid-row: 2;
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  transform: translate(100%, 0);
  animation: ${slideIn} 0.4s ease-in-out 1 forwards;
  z-index: 100;

  @media ${breakPoints.small} {
    grid-row: 1;
    grid-column: 1;
    height: auto;
  }
`;

const ContentRoot = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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

  @media ${breakPoints.small} {
    position: static;
    overflow: visible;
  }

  @media ${breakPoints.small} {
    position: relative;
  }
`;


const Title = styled.h1`
  margin: 0;
  padding: 0.5rem 0.8rem;
  border-bottom: solid 1px ${backgroundDark};
  background-color: ${primaryColorLight};
  font-family: ${secondaryFont};
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 400;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;

  span {
    width: 1rem;
    height: 1rem;
    display: inline-block;
    line-height: 0;
    margin-right: 0.25rem;

    svg {
      width: 100%;
      height: 100%;
      fill: ${backgroundDark};
    }
  }
`;

const CloseButton = styled.button`
  margin-left: auto;
  padding: 0 0 0 1rem;
  border: none;
  background-color: transparent;
  font-size: 1.25rem;
  font-weight: 400;
  font-family: ${secondaryFont};
  transform: translate(0, -1px);
`;

const Content = styled.div`
  padding: 1rem 0.4rem;
  display: flex;
  flex-direction: column;
`;

const SettingGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-row-gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const SettingsInputContainer = styled.div`
  grid-column: 2;
  grid-row: 2;
`;

const DisabledSettingsInputContainer = styled(SettingsInputContainer)`
  opacity: 0.5;
  pointer-events: none;
`;

const CompostionButtonBase = styled(BlockButton)`
  text-transform: capitalize;
`;
const CompostionButtonHighlight = styled(BlockButtonHighlighted)`
  text-transform: capitalize;
`;

const Label = styled.label`
  font-size: 1rem;
  display: block;
  grid-column: 2;
  grid-row: 1;

  @media ${breakPoints.medium} {
    font-size: 0.75rem;
  }
`;

const DisabledLabel = styled(Label)`
  opacity: 0.5;
`;

const DigitLevelButton = styled.button<{$selected: boolean}>`
  font-size: 0.85rem;
  text-transform: none;
  display: block;
  background-color: transparent;
  padding: 0.45rem 0;
  display: flex;
  position: relative;
  margin: 0;

  &:hover {
    &:before {
      background-color: ${backgroundDark};
    }
  }

  &:focus, &:active {
    color: ${backgroundDark};
  }

  &:before {
    content: '';
    display: block;
    width: 0.85rem;
    height: 0.85rem;
    border: solid 1px ${backgroundDark};
    border-radius: 2000px;
    background-color: ${({$selected}) => $selected ? backgroundDark : '#fff'};
    margin-right: 0.75rem;
    transition: all 0.1s ease-in-out;
    position: relative;
    z-index: 2;
  }

  &:after {
    content: '';
    width: 0.5rem;
    border-right: solid 1px ${backgroundDark};
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
  }

  &:first-child:after {
    top: 0.7rem;
  }

  &:last-child:after {
    bottom: 0.7rem;
  }

  @media ${breakPoints.medium} {
    font-size: 0.75rem;
  }
`;

const ResetButton = styled(BlockButton)`
  margin: 1rem auto;
`;

export interface SettingsOptions {
  digitLevel?: boolean;
  compositionType?: boolean;
  hideClusterOverlay?: boolean;
}

interface Props {
  onClose: () => void;
  settingsOptions: SettingsOptions;
}

const Settings = (props: Props) => {
  const {
    onClose, settingsOptions,
  } = props;
  const history = useHistory();
  const params = useQueryParams();
  const getString = useFluent();

  const updateSetting = (param: string, value: string | number) => {
    const query = queryString.stringify({...params, [param]: value});
    const newUrl = query ? history.location.pathname + '?' + query : history.location.pathname;
    history.push(newUrl);
  };

  const resetSettings = () => {
    const {
      digit_level: _unusedDigitLevel,
      composition_type: _unusedCompositionType,
      hide_clusters: _hideClusters,
      ...rest
    } = params;
    const query = queryString.stringify({...rest});
    const newUrl = query ? history.location.pathname + '?' + query : history.location.pathname;
    history.push(newUrl);
  };

  let compositionOptions: React.ReactElement<any> | null;
  if (settingsOptions.compositionType !== undefined) {
    const CompanyButton = (!params.composition_type && defaultCompositionType === CompositionType.Companies) ||
                          (params.composition_type === CompositionType.Companies)
                          ? CompostionButtonHighlight : CompostionButtonBase;

    const EmployeeButton = (!params.composition_type && defaultCompositionType === CompositionType.Employees) ||
                          (params.composition_type === CompositionType.Employees)
                          ? CompostionButtonHighlight : CompostionButtonBase;
    const InputContainer = settingsOptions.compositionType === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.compositionType === true ? Label : DisabledLabel;
    const tooltipText = settingsOptions.compositionType === true
      ? getString('glossary-composition') : getString('glossary-composition-disabled');
    compositionOptions = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-numbers-based-on')}</LabelContainer>
        <InputContainer>
          <EmployeeButton
            onClick={() => updateSetting('composition_type', CompositionType.Employees)}
          >
            {CompositionType.Employees}
          </EmployeeButton>
          <CompanyButton
            onClick={() => updateSetting('composition_type', CompositionType.Companies)}
          >
            {CompositionType.Companies}
          </CompanyButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    compositionOptions = null;
  }

  let digitLevelOptions: React.ReactElement<any> | null;
  if (settingsOptions.digitLevel !== undefined) {
    const InputContainer = settingsOptions.compositionType === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.compositionType === true ? Label : DisabledLabel;
    const tooltipText = settingsOptions.compositionType === true
      ? getString('glossary-digit-level') : getString('glossary-digit-level-disabled');
    digitLevelOptions = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-detail-level')}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Sector)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Sector) ||
                    (params.digit_level === DigitLevel.Sector.toString())}
          >
            {DigitLevel.Sector}-{getString('global-ui-digit-level')} / {getString('global-ui-sector-level')}
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Two)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Two) ||
                    (params.digit_level === DigitLevel.Two.toString())}
          >
            {DigitLevel.Two}-{getString('global-ui-digit-level')}
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Three)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Three) ||
                    (params.digit_level === DigitLevel.Three.toString())}
          >
            {DigitLevel.Three}-{getString('global-ui-digit-level')}
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Four)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Four) ||
                    (params.digit_level === DigitLevel.Four.toString())}
          >
            {DigitLevel.Four}-{getString('global-ui-digit-level')}
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Five)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Five) ||
                    (params.digit_level === DigitLevel.Five.toString())}
          >
            {DigitLevel.Five}-{getString('global-ui-digit-level')}
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Six)}
            $selected={(!params.digit_level && defaultDigitLevel === DigitLevel.Six) ||
                    (params.digit_level === DigitLevel.Six.toString())}
          >
            {DigitLevel.Six}-{getString('global-ui-digit-level')}
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    digitLevelOptions = null;
  }

  let clusterOverlayToggle: React.ReactElement<any> | null;
  if (settingsOptions.hideClusterOverlay !== undefined) {
    const OffButton = params.hide_clusters && params.hide_clusters === Toggle.Off
      ? CompostionButtonHighlight : CompostionButtonBase;
    const OnButton = !params.hide_clusters || params.hide_clusters === Toggle.On
      ? CompostionButtonHighlight : CompostionButtonBase;
    const InputContainer = settingsOptions.hideClusterOverlay === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.hideClusterOverlay === true ? Label : DisabledLabel;
    const tooltipText = settingsOptions.hideClusterOverlay === true
      ? getString('glossary-cluster-overlay') : getString('glossary-cluster-overlay-disabled');
    clusterOverlayToggle = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-show-clusters')}</LabelContainer>
        <InputContainer>
          <OnButton
            onClick={() => updateSetting('hide_clusters', Toggle.On)}
          >
            {Toggle.On}
          </OnButton>
          <OffButton
            onClick={() => updateSetting('hide_clusters', Toggle.Off)}
          >
            {Toggle.Off}
          </OffButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    clusterOverlayToggle = null;
  }

  return (
    <Root>
      <ContentRoot>
        <Title>
          <span dangerouslySetInnerHTML={{__html: gearIcon}} />
          {getString('global-ui-settings')}
          <CloseButton onClick={onClose}>×</CloseButton>
        </Title>
        <Content>
          {compositionOptions}
          {digitLevelOptions}
          {clusterOverlayToggle}
          <ResetButton onClick={resetSettings}>
            {getString('global-ui-settings-reset')}
          </ResetButton>
        </Content>
      </ContentRoot>
    </Root>
  );
};


export default Settings;
