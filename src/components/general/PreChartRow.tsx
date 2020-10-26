import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {breakPoints} from '../../styling/GlobalGrid';
import useFluent from '../../hooks/useFluent';
import raw from 'raw.macro';
import SearchIndustryInGraph, {SearchInGraphOptions} from './SearchIndustryInGraph';
import CurrentSettingsTooltip from '../dataViz/settings/CurrentSettingsTooltip';
import Settings, {SettingsOptions} from '../dataViz/settings';
import Tooltip, {TooltipTheme, TooltipPosition} from './Tooltip';
import {ButtonBase} from './Utils';
import HowToRead from './howToRead';

const gearIcon = raw('../../assets/icons/settings.svg');

const Root = styled.div`
  display: contents;

  @media ${breakPoints.small} {
    display: block;
    grid-row: 2;
    grid-column: 1;
  }
`;

const RowBase = styled.div`
  grid-column: 1;
  padding: 0.75rem 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const LeftColumn = styled(RowBase)`
  grid-row: 1;
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  text-align: right;
`;

const RightColumn = styled(RowBase)`
  grid-column: 2;
`;

const IndicatorRoot = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const SettingsButton = styled(ButtonBase)`
  margin-left: auto;
  height: 100%;
`;

export interface Indicator {
  text: React.ReactNode;
  tooltipContent?: React.ReactNode;
}

interface Props {
  indicator?: Indicator;
  searchInGraphOptions?: SearchInGraphOptions;
  settingsOptions?: SettingsOptions;
}

const PreChartRow = (props: Props) => {
  const {
    indicator, searchInGraphOptions, settingsOptions,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const getString = useFluent();

  const indicatorTooltip = indicator && indicator.tooltipContent ? (
    <Tooltip
      explanation={indicator.tooltipContent}
    />
  ) : null;
  const indicatorElm = indicator ? (
    <IndicatorRoot>
      {indicatorTooltip}
      {indicator.text}
    </IndicatorRoot>
  ) : null;

  const searchInGraph = searchInGraphOptions ? (
    <SearchIndustryInGraph {...searchInGraphOptions} />
  ) : null;

  const settingsButton = settingsOptions ? (
    <Tooltip
      explanation={!settingsOpen
        ? <CurrentSettingsTooltip settingsOptions={settingsOptions} />
        : null
      }
      theme={TooltipTheme.Dark}
      tooltipPosition={TooltipPosition.Bottom}
    >
      <SettingsButton
        onClick={() => setSettingsOpen(current => !current)}
      >
        <span dangerouslySetInnerHTML={{__html: gearIcon}} />
        {getString('global-ui-settings')}
      </SettingsButton>
    </Tooltip>
  ) : null;

  const settingsPanel = settingsOpen ? (
    <Settings
      onClose={() => setSettingsOpen(false)}
    />
  ) : null;

  return (
    <>
      <Root>
        <RightColumn>
          {searchInGraph}
          {settingsButton}
        </RightColumn>
        <LeftColumn>
          <HowToRead />
          {indicatorElm}
        </LeftColumn>
      </Root>
      {settingsPanel}
    </>
  );
};

export default React.memo(PreChartRow);
