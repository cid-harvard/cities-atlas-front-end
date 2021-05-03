import React, {useRef, useEffect, useCallback} from 'react';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import DataViz, {
  VizType,
  ClusterBarChartDatum,
} from 'react-fast-charts';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import useFluent from '../../../hooks/useFluent';
import {max} from 'd3';
import {usePrevious} from 'react-use';
import {rgba} from 'polished';

interface Props {
  data: ClusterBarChartDatum[];
  compositionType: CompositionType;
  height: number;
  loading: boolean;
  primaryName: string;
  secondaryName: string;
  triggerImageDownload: undefined | (() => void);
}

// A/B strings used to allow for sorting in order
export enum Group {
  Primary = 'A',
  Secondary = 'B',
}

const Chart = (props: Props) => {
  const {
    data, compositionType, height, loading,
    primaryName, secondaryName, triggerImageDownload,
  } = props;
  const getString = useFluent();
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const setHovered = (datum: ClusterBarChartDatum, coords: {x: number, y: number}) => {
    const node = tooltipRef.current;
    if (node) {
      const filteredData = data.filter(d => d.x === datum.x);
      const primaryDatum = filteredData.find(d => d.groupName === Group.Primary);
      const secondaryDatum = filteredData.find(d => d.groupName === Group.Secondary);
      const primaryValue = primaryDatum ? primaryDatum.y : 0;
      const secondaryValue = secondaryDatum ? secondaryDatum.y : 0;
      const primaryValueText = primaryValue === 0 || primaryValue >= 0.01
        ? primaryValue.toFixed(2) + '%' : '<0.01%';
      const secondaryValueText = secondaryValue === 0 || secondaryValue >= 0.01
        ? secondaryValue.toFixed(2) + '%' : '<0.01%';
      const primaryDiff = primaryValue - secondaryValue;
      const secondaryDiff = secondaryValue - primaryValue;
      let primaryDiffValue: string;
      if (primaryDiff < 0) {
        primaryDiffValue = '';
      } else if (primaryDiff < 0.01) {
        primaryDiffValue = '+<0.01%';
      } else {
        primaryDiffValue = '+' + primaryDiff.toFixed(2) + '%';
      }
      let secondaryDiffValue: string;
      if (secondaryDiff < 0) {
        secondaryDiffValue = '';
      } else if (secondaryDiff < 0.01) {
        secondaryDiffValue = '+<0.01%';
      } else {
        secondaryDiffValue = '+' + secondaryDiff.toFixed(2) + '%';
      }
      node.innerHTML = getStandardTooltip({
        title: datum.x,
        color: rgba(datum.fill ? datum.fill : 'gray', 0.3),
        rows: [
          ['', primaryName, secondaryName ],
          [
            getString('tooltip-text-share-of', {value: compositionType}),
            primaryValueText,
            secondaryValueText,
          ],
          ['Difference', primaryDiffValue, secondaryDiffValue],
        ],
        boldColumns: [1, 2],
        underlineRows: [0],
        additionalHTML: datum.onClick
          ? `<div style="padding: 0.35rem; font-style: italic; font-size: 0.7rem; text-align: center;">
              ${getString('global-click-to-expand-industry')}
            </div>`
          : undefined,
      });
      node.style.top = coords.y + 'px';
      node.style.left = coords.x + 'px';
      node.style.display = 'block';
    }
  };

  const removeHovered = useCallback(() => {
    const node = tooltipRef.current;
    if (node) {
      node.style.display = 'none';
    }
  }, [tooltipRef]);

  useEffect(() => {
    removeHovered();
  }, [data, removeHovered]);

  const allYValues: number[] = [];

  const dataWithHover = data.map(d => {
    allYValues.push(d.y);
    return {
      ...d,
      onMouseMove: setHovered,
      onMouseLeave: removeHovered,
    };
  });

  const maxY = max(allYValues);
  const prevMaxY = usePrevious(maxY);

  return (
    <>
      <DataViz
        id={'example-cluster-bar-chart'}
        vizType={VizType.ClusterBarChart}
        data={dataWithHover}
        axisLabels={{left: getString('axis-text-percent-total-value', {
          value: compositionType,
        })}}
        height={height}
        formatAxis={{y: v => parseFloat(v.toFixed(2)) + '%'}}
        animateBars={loading ? undefined : 300}
        axisMinMax={{minY: 0, maxY}}
        animateAxis={{
          animationDuration: 500,
          startMaxY: prevMaxY ? prevMaxY : 0.1,
          startMinY: 0,
        }}
        triggerSVGDownload={triggerImageDownload}
        chartTitle={`${primaryName} - ${secondaryName} Industry Comparison`}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default React.memo(Chart);
