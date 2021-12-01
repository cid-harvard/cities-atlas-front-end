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
  baseColor,
} from '../../../styling/styleUtils';
import {
  CompositionType,
  defaultDigitLevel,
  defaultCompositionType,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {breakPoints} from '../../../styling/GlobalGrid';
import {
  ClusterMode,
  defaultClusterMode,
  NodeSizing,
  defaultNodeSizing,
  ColorBy,
  ClusterLevel,
  defaultClusterLevel,
  CityNodeSizing,
  CityColorBy,
  defaultCityNodeSizing,
  defaultAggregationMode,
  AggregationMode,
} from '../../../routing/routes';
import raw from 'raw.macro';
import Tooltip, {TooltipTheme} from '../../general/Tooltip';
import upperFirst from 'lodash/upperFirst';
import RCAThresholdSlider from './RCAThresholdSlider';
import googleAnalyticsEvent from '../../analytics/googleAnalyticsEvent';

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

  &.disabled-option {
    opacity: 0.5;
    cursor: default;
    &:hover {
      color: ${baseColor};
      background-color: transparent;
    }
  }
`;
const CompostionButtonHighlight = styled(BlockButtonHighlighted)`
  text-transform: capitalize;

  &.disabled-option {
    opacity: 0.5;
    cursor: default;
    &:hover {
      color: ${baseColor};
      background-color: transparent;
    }
  }
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
  width: 100%;
  text-transform: none;
  display: block;
  background-color: transparent;
  padding: 0.45rem 0;
  display: flex;
  position: relative;
  margin: 0;

  &:hover:not(.disabled-option) {
    &:before {
      background-color: ${backgroundDark};
    }
  }
  &.disabled-option {
    opacity: 0.5;
    cursor: default;
  }

  &:focus, &:active {
    color: ${backgroundDark};
  }

  &:before {
    flex-shrink: 0;
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
    flex-shrink: 0;
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

  &:last-child {
    align-items: flex-end;
    &:after {
      bottom: 0.7rem;
    }
  }

  @media ${breakPoints.medium} {
    font-size: 0.75rem;
  }
`;

const DigitLevelSoloButton = styled(DigitLevelButton)`
   &:after {
     display: none;
   }
`;

const ResetButton = styled(BlockButton)`
  margin: 1rem auto;
`;

export interface SettingsOptions {
  digitLevel?: boolean | {
    sixDigitOnlyMessage?: string;
    defaultDigitLevel?: DigitLevel;
  };
  compositionType?: boolean | {
    disabledOptions?: CompositionType[];
  };
  clusterOverlayMode?: boolean;
  nodeSizing?: boolean | {
    rca: boolean;
  };
  colorBy?: boolean | {
    nodes: boolean,
  };
  clusterLevel?: boolean | {
    disabledOptions?: ClusterLevel[];
  };
  cityNodeSizing?: boolean;
  cityColorBy?: boolean;
  aggregationMode?: boolean;
  rcaThreshold?: boolean;
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
    googleAnalyticsEvent('Viz Options', param, `${value}`);
    history.push(newUrl);
  };

  const resetSettings = () => {
    const {
      digit_level: _unusedDigitLevel,
      cluster_level: _unusedClusterLevel,
      composition_type: _unusedCompositionType,
      cluster_overlay: _unusedHideClusters,
      node_sizing: _unusedNodeSizing,
      color_by: _unusedColorBy,
      city_color_by: _unusedCityColorBy,
      city_node_sizing: _unusedCitySizeBy,
      aggregation: _unusedAggregation,
      rca_threshold: _rcaThreshold,
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
    const InputContainer = settingsOptions.compositionType !== false
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.compositionType !== false ? Label : DisabledLabel;
    const tooltipText = settingsOptions.compositionType !== false
      ? getString('glossary-composition') : getString('glossary-composition-disabled');
    const disabledOptions = typeof settingsOptions.compositionType === 'object' &&
      settingsOptions.compositionType.disabledOptions ? settingsOptions.compositionType.disabledOptions : [];
    compositionOptions = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-numbers-based-on')}</LabelContainer>
        <InputContainer>
          <EmployeeButton
            onClick={disabledOptions.includes(CompositionType.Employees)
              ? undefined : () => updateSetting('composition_type', CompositionType.Employees)}
            className={disabledOptions.includes(CompositionType.Employees) ? 'disabled-option' : undefined}
          >
            <Tooltip
              explanation={disabledOptions.includes(CompositionType.Employees)
                ? getString('global-ui-settings-option-na')
                : null
              }
              theme={TooltipTheme.Dark}
              cursor={disabledOptions.includes(CompositionType.Employees) ? 'default' : 'pointer'}
            >
              {CompositionType.Employees}
            </Tooltip>
          </EmployeeButton>
          <CompanyButton
            onClick={disabledOptions.includes(CompositionType.Companies)
              ? undefined : () => updateSetting('composition_type', CompositionType.Companies)}
            className={disabledOptions.includes(CompositionType.Companies) ? 'disabled-option' : undefined}
          >
            <Tooltip
              explanation={disabledOptions.includes(CompositionType.Companies)
                ? getString('global-ui-settings-option-na')
                : null
              }
              theme={TooltipTheme.Dark}
              cursor={disabledOptions.includes(CompositionType.Companies) ? 'default' : 'pointer'}
            >
              {CompositionType.Companies}
            </Tooltip>
          </CompanyButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    compositionOptions = null;
  }

  let aggregationMode: React.ReactElement<any> | null;
  if (settingsOptions.aggregationMode !== undefined) {
    const ClusterButton = (!params.aggregation && defaultAggregationMode === AggregationMode.cluster) ||
      (params.aggregation === AggregationMode.cluster)
        ? CompostionButtonHighlight : CompostionButtonBase;
    const NaicButton = (!params.aggregation && defaultAggregationMode === AggregationMode.industries) ||
      (params.aggregation === AggregationMode.industries)
      ? CompostionButtonHighlight : CompostionButtonBase;
    const InputContainer = settingsOptions.aggregationMode === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.aggregationMode === true ? Label : DisabledLabel;
    aggregationMode = (
      <SettingGrid>
        <Tooltip
          explanation={getString('glossary-cluster-vs-naics')}
        />
        <LabelContainer>{getString('global-ui-aggregation-mode')}</LabelContainer>
        <InputContainer>
          <NaicButton
            onClick={() => updateSetting('aggregation', AggregationMode.industries)}
          >
            {getString('global-text-industry-groups')}
          </NaicButton>
          <ClusterButton
            onClick={() => updateSetting('aggregation', AggregationMode.cluster)}
          >
            {getString('global-ui-skill-clusters')}
          </ClusterButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    aggregationMode = null;
  }

  let digitLevelOptions: React.ReactElement<any> | null;
  if (settingsOptions.digitLevel !== undefined) {
    const InputContainer = settingsOptions.digitLevel !== false
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.digitLevel !== false ? Label : DisabledLabel;
    const tooltipText = settingsOptions.digitLevel !== false
      ? getString('glossary-digit-level') : getString('glossary-digit-level-disabled');
    const sixDigitOnlyMessage = typeof settingsOptions.digitLevel === 'object' &&
      settingsOptions.digitLevel.sixDigitOnlyMessage ? settingsOptions.digitLevel.sixDigitOnlyMessage : '';
    const defaultValue = typeof settingsOptions.digitLevel === 'object' && settingsOptions.digitLevel.defaultDigitLevel
      ? settingsOptions.digitLevel.defaultDigitLevel : defaultDigitLevel;
    digitLevelOptions = sixDigitOnlyMessage ? (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-detail-level')}</LabelContainer>
        <InputContainer>
          <DigitLevelSoloButton
            $selected={true}
          >
            {DigitLevel.Six}-{getString('global-ui-digit-level')}
          </DigitLevelSoloButton>
          <small><em>{sixDigitOnlyMessage}</em></small>
        </InputContainer>
      </SettingGrid>
    ) : (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-detail-level')}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Sector)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Sector) ||
                    (params.digit_level === DigitLevel.Sector.toString()))}
          >
            <span>{DigitLevel.Sector}-{getString('global-ui-digit-level')} / {getString('global-ui-sector-level')}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Two)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Two) ||
                    (params.digit_level === DigitLevel.Two.toString()))}
          >
            <span>{DigitLevel.Two}-{getString('global-ui-digit-level')}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Three)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Three) ||
                    (params.digit_level === DigitLevel.Three.toString()))}
          >
            <span>{DigitLevel.Three}-{getString('global-ui-digit-level')}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Four)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Four) ||
                    (params.digit_level === DigitLevel.Four.toString()))}
          >
            <span>{DigitLevel.Four}-{getString('global-ui-digit-level')}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Five)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Five) ||
                    (params.digit_level === DigitLevel.Five.toString()))}
          >
            <span>{DigitLevel.Five}-{getString('global-ui-digit-level')}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('digit_level', DigitLevel.Six)}
            $selected={settingsOptions.digitLevel !== false && ((!params.digit_level && defaultValue === DigitLevel.Six) ||
                    (params.digit_level === DigitLevel.Six.toString()))}
          >
            <span>{DigitLevel.Six}-{getString('global-ui-digit-level')}</span>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    digitLevelOptions = null;
  }
  let clusterLevelOptions: React.ReactElement<any> | null;
  if (settingsOptions.clusterLevel !== undefined) {
    const InputContainer = settingsOptions.clusterLevel !== false
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.clusterLevel !== false ? Label : DisabledLabel;
    const tooltipText = settingsOptions.clusterLevel !== false
      ? getString('glossary-cluster-level') : getString('glossary-cluster-level-disabled');
    const disabledOptions = typeof settingsOptions.clusterLevel === 'object' &&
      settingsOptions.clusterLevel.disabledOptions ? settingsOptions.clusterLevel.disabledOptions : [];
    clusterLevelOptions = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-cluster-level')}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={!disabledOptions.includes(ClusterLevel.C1) ?
              () => updateSetting('cluster_level', ClusterLevel.C1) : undefined}
            className={disabledOptions.includes(ClusterLevel.C1) ? 'disabled-option' : undefined}
            $selected={settingsOptions.clusterLevel !== false && ((!params.cluster_level && defaultClusterLevel === ClusterLevel.C1) ||
              params.cluster_level === ClusterLevel.C1)
            }
          >
            <Tooltip
              explanation={disabledOptions.includes(ClusterLevel.C1)
                ? getString('global-ui-settings-option-na')
                : null
              }
              theme={TooltipTheme.Dark}
              cursor={disabledOptions.includes(ClusterLevel.C1) ? 'default' : 'pointer'}
            >
              <span>{getString('global-ui-cluster-aggregation-level', {cluster: 'cluster_' + ClusterLevel.C1})}</span>
            </Tooltip>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={!disabledOptions.includes(ClusterLevel.C3) ?
              () => updateSetting('cluster_level', ClusterLevel.C3) : undefined}
            className={disabledOptions.includes(ClusterLevel.C3) ? 'disabled-option' : undefined}
            $selected={settingsOptions.clusterLevel !== false && ((!params.cluster_level && defaultClusterLevel === ClusterLevel.C3) ||
              params.cluster_level === ClusterLevel.C3)
            }
          >
            <Tooltip
              explanation={disabledOptions.includes(ClusterLevel.C3)
                ? getString('global-ui-settings-option-na')
                : null
              }
              theme={TooltipTheme.Dark}
              cursor={disabledOptions.includes(ClusterLevel.C3) ? 'default' : 'pointer'}
            >
              <span>{getString('global-ui-cluster-aggregation-level', {cluster: 'cluster_' + ClusterLevel.C3})}</span>
            </Tooltip>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    clusterLevelOptions = null;
  }

  let clusterOverlayToggle: React.ReactElement<any> | null;
  if (settingsOptions.clusterOverlayMode !== undefined) {
    const InputContainer = settingsOptions.clusterOverlayMode === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.clusterOverlayMode === true ? Label : DisabledLabel;
    const tooltipText = settingsOptions.clusterOverlayMode === true
      ? getString('glossary-cluster-overlay') : getString('glossary-cluster-overlay-disabled');
    clusterOverlayToggle = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{getString('global-ui-show-clusters')}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={() => updateSetting('cluster_overlay', ClusterMode.outline)}
            $selected={(!params.cluster_overlay && defaultClusterMode === ClusterMode.outline) ||
              params.cluster_overlay === ClusterMode.outline
            }
          >
            <span>{upperFirst(ClusterMode.outline)}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('cluster_overlay', ClusterMode.overlay)}
            $selected={(!params.cluster_overlay && defaultClusterMode === ClusterMode.overlay) ||
              params.cluster_overlay === ClusterMode.overlay
            }
          >
            <span>{upperFirst(ClusterMode.overlay)}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('cluster_overlay', ClusterMode.none)}
            $selected={(!params.cluster_overlay && defaultClusterMode === ClusterMode.none) ||
              params.cluster_overlay === ClusterMode.none
            }
          >
            <span>{upperFirst(ClusterMode.none)}</span>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    clusterOverlayToggle = null;
  }


  let nodeSizingOptions: React.ReactElement<any> | null;
  if (settingsOptions.nodeSizing !== undefined) {
    const nodeSizingActive = settingsOptions.nodeSizing === true || typeof settingsOptions.nodeSizing === 'object';
    const InputContainer = nodeSizingActive === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = nodeSizingActive === true ? Label : DisabledLabel;
    const defaultValue = typeof settingsOptions.nodeSizing === 'object' && settingsOptions.nodeSizing.rca
      ? NodeSizing.rca : defaultNodeSizing;
    const currentValue = typeof settingsOptions.nodeSizing !== 'object' && params.node_sizing === NodeSizing.rca
      ? defaultValue : params.node_sizing;
    const sizeByRca = typeof settingsOptions.nodeSizing === 'object' && settingsOptions.nodeSizing.rca
      ? (
        <DigitLevelButton
          onClick={() => updateSetting('node_sizing', NodeSizing.rca)}
          $selected={(!currentValue && defaultValue === NodeSizing.rca) || currentValue === NodeSizing.rca}
        >
          <span>{getString('global-formatted-size-by', {type: NodeSizing.rca})}</span>
        </DigitLevelButton>
      ) : null;
    nodeSizingOptions = (
      <SettingGrid>
        <Tooltip
          explanation={getString('glossary-node-sizing')}
        />
        <LabelContainer>{getString('global-ui-node-sizing')}</LabelContainer>
        <InputContainer>
          {sizeByRca}
          <DigitLevelButton
            onClick={() => updateSetting('node_sizing', NodeSizing.cityEmployees)}
            $selected={(!currentValue && defaultValue === NodeSizing.cityEmployees) || currentValue === NodeSizing.cityEmployees}
          >
            <span>{getString('global-formatted-size-by', {type: NodeSizing.cityEmployees})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('node_sizing', NodeSizing.cityCompanies)}
            $selected={(!currentValue && defaultValue === NodeSizing.cityCompanies) || currentValue === NodeSizing.cityCompanies}
          >
            <span>{getString('global-formatted-size-by', {type: NodeSizing.cityCompanies})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('node_sizing', NodeSizing.uniform)}
            $selected={(!currentValue && defaultValue === NodeSizing.uniform) || currentValue === NodeSizing.uniform}
          >
            <span>{getString('global-formatted-size-by', {type: NodeSizing.uniform})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('node_sizing', NodeSizing.globalEmployees)}
            $selected={(!currentValue && defaultValue === NodeSizing.globalEmployees) || currentValue === NodeSizing.globalEmployees}
          >
            <span>{getString('global-formatted-size-by', {type: NodeSizing.globalEmployees})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('node_sizing', NodeSizing.globalCompanies)}
            $selected={(!currentValue && defaultValue === NodeSizing.globalCompanies) || currentValue === NodeSizing.globalCompanies}
          >
            <span>{getString('global-formatted-size-by', {type: NodeSizing.globalCompanies})}</span>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    nodeSizingOptions = null;
  }

  let colorByOptions: React.ReactElement<any> | null;
  if (settingsOptions.colorBy !== undefined) {
    const InputContainer = settingsOptions.colorBy !== false
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.colorBy !== false ? Label : DisabledLabel;
    const tooltipText = typeof settingsOptions.colorBy === 'object' && settingsOptions.colorBy.nodes
      ? getString('glossary-color-nodes-by') : getString('glossary-color-by');
    const labelText = typeof settingsOptions.colorBy === 'object' && settingsOptions.colorBy.nodes
      ? getString('global-ui-node-color-by') : getString('global-ui-color-by');
    const defaultColorByText = settingsOptions.clusterLevel !== undefined
      ? 'Knowledge Cluster (High aggregation)' : 'Industry groups (Sector level)';
    const defaultIsSelected = !params.color_by || params.color_by === ColorBy.sector;
    const rcaThreshold = settingsOptions.rcaThreshold && defaultIsSelected ? (
      <RCAThresholdSlider
        key={'rca-slider-key-' + params.rca_threshold}
        updateValue={v => updateSetting('rca_threshold', v)}
        initialValue={params.rca_threshold ? parseFloat(params.rca_threshold) : 1}
      />
    ) : null;
    colorByOptions = (
      <SettingGrid>
        <Tooltip
          explanation={tooltipText}
        />
        <LabelContainer>{labelText}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={!defaultIsSelected ? () => updateSetting('color_by', ColorBy.sector) : undefined}
            $selected={defaultIsSelected}
          >
            <div>{defaultColorByText}{rcaThreshold}</div>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('color_by', ColorBy.education)}
            $selected={params.color_by === ColorBy.education}
          >
            <span>{getString('global-formatted-color-by', {type: ColorBy.education})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('color_by', ColorBy.wage)}
            $selected={params.color_by === ColorBy.wage}
          >
            <span>{getString('global-formatted-color-by', {type: ColorBy.wage})}</span>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    colorByOptions = null;
  }

  let cityColorByOptions: React.ReactElement<any> | null;
  if (settingsOptions.cityColorBy !== undefined) {
    const InputContainer = settingsOptions.cityColorBy !== false
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.cityColorBy !== false ? Label : DisabledLabel;
    cityColorByOptions = (
      <SettingGrid>
        <Tooltip
          explanation={getString('glossary-city-color-by')}
        />
        <LabelContainer>{getString('global-ui-node-color-by')}</LabelContainer>
        <InputContainer>
          <DigitLevelSoloButton
            $selected={true}
          >
            {upperFirst(CityColorBy.proximity)}
          </DigitLevelSoloButton>
          <small><em>{getString('color-by-proximity-only')}</em></small>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    cityColorByOptions = null;
  }

  let cityNodeSizingOptions: React.ReactElement<any> | null;
  if (settingsOptions.cityNodeSizing !== undefined) {
    const InputContainer = settingsOptions.cityNodeSizing === true
      ? SettingsInputContainer : DisabledSettingsInputContainer;
    const LabelContainer = settingsOptions.cityNodeSizing === true ? Label : DisabledLabel;
    cityNodeSizingOptions = (
      <SettingGrid>
        <Tooltip
          explanation={getString('glossary-city-node-sizing')}
        />
        <LabelContainer>{getString('global-ui-node-sizing')}</LabelContainer>
        <InputContainer>
          <DigitLevelButton
            onClick={() => updateSetting('city_node_sizing', CityNodeSizing.population)}
            $selected={(!params.city_node_sizing && defaultCityNodeSizing === CityNodeSizing.population) || params.city_node_sizing === CityNodeSizing.population}
          >
            <span>{getString('global-formatted-size-by', {type: CityNodeSizing.population})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('city_node_sizing', CityNodeSizing.gdpPpp)}
            $selected={(!params.city_node_sizing && defaultCityNodeSizing === CityNodeSizing.gdpPpp) || params.city_node_sizing === CityNodeSizing.gdpPpp}
          >
            <span>{getString('global-formatted-size-by', {type: CityNodeSizing.gdpPpp})}</span>
          </DigitLevelButton>
          <DigitLevelButton
            onClick={() => updateSetting('city_node_sizing', CityNodeSizing.uniform)}
            $selected={(!params.city_node_sizing && defaultCityNodeSizing === CityNodeSizing.uniform) || params.city_node_sizing === CityNodeSizing.uniform}
          >
            <span>{getString('global-formatted-size-by', {type: CityNodeSizing.uniform})}</span>
          </DigitLevelButton>
        </InputContainer>
      </SettingGrid>
    );
  } else {
    cityNodeSizingOptions = null;
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
          {aggregationMode}
          {digitLevelOptions}
          {clusterLevelOptions}
          {clusterOverlayToggle}
          {nodeSizingOptions}
          {colorByOptions}
          {cityColorByOptions}
          {cityNodeSizingOptions}
          <ResetButton onClick={resetSettings}>
            {getString('global-ui-settings-reset')}
          </ResetButton>
        </Content>
      </ContentRoot>
    </Root>
  );
};


export default Settings;
