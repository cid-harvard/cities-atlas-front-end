import React from 'react';
import styled from 'styled-components/macro';
import {breakPoints} from '../../styling/GlobalGrid';
import {
  baseColor,
  secondaryFont,
} from '../../styling/styleUtils';
import useFluent from '../../hooks/useFluent';
import raw from 'raw.macro';
import Tooltip from '../general/Tooltip';
import SearchIndustryInGraph, {SearchInGraphOptions} from './SearchIndustryInGraph';

const readThisChartIconSVG = raw('../../assets/icons/read-this-chart.svg');
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

const ButtonBase = styled.button`
  color: ${baseColor};
  background-color: transparent;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  display: flex;
  align-items: center;
  font-size: clamp(0.75rem, 1.25vw, 0.9rem);
  padding: clamp(0.25rem, 0.5vw, 0.6rem);
  flex-shrink: 0;

  span {
    width: clamp(0.65rem, 1.5vw, 0.85rem);
    height: clamp(0.65rem, 1.5vw, 0.85rem);
    display: inline-block;
    line-height: 0;
    margin-right: 0.25rem;

    svg {
      width: 100%;
      height: 100%;
      fill: ${baseColor};
    }
  }

  &:hover {
    background-color: ${baseColor};
    color: #fff;

    span svg {
      fill: #fff;
    }
  }
`;

const ReadChartButton = styled(ButtonBase)`
  border: solid 1px ${baseColor};
  margin-right: 0.25rem;
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
  onReadThisChart?: () => void;
  indicator?: Indicator;
  searchInGraphOptions?: SearchInGraphOptions;
  onOpenSettings?: () => void;
}

const PreChartRow = (props: Props) => {
  const {
    onReadThisChart, indicator, searchInGraphOptions, onOpenSettings,
  } = props;

  const getString = useFluent();

  const readChartButton = onReadThisChart ? (
    <ReadChartButton
      onClick={onReadThisChart}
    >
      <span dangerouslySetInnerHTML={{__html: readThisChartIconSVG}} />
      {getString('global-ui-read-chart')}
    </ReadChartButton>
  ) : null;

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

  const settingsButton = onOpenSettings ? (
    <SettingsButton
      onClick={onOpenSettings}
    >
      <span dangerouslySetInnerHTML={{__html: gearIcon}} />
      {getString('global-ui-settings')}
    </SettingsButton>
  ) : null;

  return (
    <Root>
      <RightColumn>
        {searchInGraph}
        {settingsButton}
      </RightColumn>
      <LeftColumn>
        {readChartButton}
        {indicatorElm}
      </LeftColumn>
    </Root>
  );
};

export default React.memo(PreChartRow);
