import React, {useState} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
} from 'react-comparison-bar-chart';
import {
  secondaryFont,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {rgba} from 'polished';

const Tooltip = styled.div`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  padding-bottom: 0.5rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  transition: opacity 0.15s ease;
  color: #333;
  background-color: #fff;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 1.5rem));
  font-family: ${secondaryFont};
`;

const TooltipTitle = styled.div`
  padding: 0.5rem;
`;

const TooltipSubsectionGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 0.5rem;
  padding: 0.5rem;
`;

const SemiBold = styled.span`
  font-weight: 500;
  display: flex;
  justify-content: flex-end;
  text-align: right;
`;
const Cell = styled.div`
  display: flex;
  justify-content: flex-end;
  text-align: right;
`;

const ArrowContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
  position: absolute;
  transform: translate(0, 100%);
`;

const Arrow = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  position: relative;
  display: flex;
  justify-content: center;
  left: -0.25rem;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid #dfdfdf;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 1px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #fff;
  }
`;

const formatAxisValue = (value: number) => {
  return parseFloat((value).toFixed(1)) + '%';
};

interface Props {
  primaryData: BarDatum[];
  secondaryData: BarDatum[];
  primaryTotal: number;
  secondaryTotal: number;
}

const Chart = (props: Props) => {
  const {
    primaryData, secondaryData, primaryTotal, secondaryTotal,
  } = props;

  const [hovered, setHovered] = useState<RowHoverEvent | undefined>(undefined);

  let tooltip: React.ReactElement<any> | null;
  if (hovered && hovered.datum) {
    const {datum, mouseCoords} = hovered;
    const primaryDatum = primaryData.find(d => d.id === datum.id);
    const secondaryDatum = secondaryData.find(d => d.id === datum.id);
    const secondaryValue = secondaryDatum ? secondaryDatum.value / secondaryTotal * 100 : 0;
    const primaryValue = primaryDatum ? primaryDatum.value / primaryTotal * 100 : 0;
    const nyDiff = secondaryValue > primaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
    const bosDiff = primaryValue > secondaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
    tooltip = (
      <Tooltip
        style={{left: mouseCoords.x, top: mouseCoords.y}}
      >
        <TooltipTitle style={{backgroundColor: rgba(datum.color, 0.3)}}>
          {datum.title}
        </TooltipTitle>
        <TooltipSubsectionGrid>
          <div />
          <SemiBold>New York</SemiBold>
          <SemiBold>primary</SemiBold>
          <Cell>Share of Employees</Cell>
          <SemiBold>{secondaryValue.toFixed(2) + '%'}</SemiBold>
          <SemiBold>{primaryValue.toFixed(2) + '%'}</SemiBold>
          <Cell>Difference</Cell>
          <SemiBold>{nyDiff}</SemiBold>
          <SemiBold>{bosDiff}</SemiBold>
        </TooltipSubsectionGrid>
        <ArrowContainer>
          <Arrow />
        </ArrowContainer>
      </Tooltip>
    );
  } else {
    tooltip = null;
  }
  return (
    <>
      <ComparisonBarChart
        primaryData={primaryData}
        secondaryData={secondaryData}
        nValuesToShow={10}
        formatValue={formatAxisValue}
        titles={{
          primary: {
            h1: 'Positive primary Share (%) (Top 10)',
            h2: 'primary > New York',
          },
          secondary: {
            h1: 'Positive New York Share (%) (Top 10)',
            h2: 'New York > primary',
          },
        }}
        expandCollapseText={{
          toExpand: 'Click to see all industries',
          toCollapse: 'Show only top industries',
        }}
        axisLabel={'Difference in Share'}
        onRowHover={setHovered}
      />
      {tooltip}
    </>
  );
};

export default React.memo(Chart);
