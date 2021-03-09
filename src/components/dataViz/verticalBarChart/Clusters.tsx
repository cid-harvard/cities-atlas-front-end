import React, {useRef} from 'react';
import {scaleLog, scaleLinear} from 'd3-scale';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  CompositionType,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {intensityColorRange, educationColorRange, wageColorRange} from '../../../styling/styleUtils';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import useFluent from '../../../hooks/useFluent';
import Tooltip from './../../general/Tooltip';
import {defaultYear} from '../../../Utils';
import {
  BasicLabel,
} from '../../../styling/styleUtils';
import {ClusterLevel, ColorBy} from '../../../routing/routes';
import {
  useGlobalClusterMap,
} from '../../../hooks/useGlobalClusterData';
import {tickMarksForMinMax} from './getNiceLogValues';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';

interface Props {
  data: SuccessResponse['clusterRca'];
  compositionType: CompositionType;
  clusterLevel: ClusterLevel;
  colorBy: ColorBy;
}

const Industries = (props: Props) => {
  const {data, compositionType, clusterLevel, colorBy} = props;
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const getString = useFluent();
  const clusterMap = useGlobalClusterMap();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Six, year: defaultYear, clusterLevel: parseInt(clusterLevel, 10),
  });

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredClusterRCA = data.filter(d => clusterLevel === (d.level as number).toString() && d[field] && (d[field] as number) > 0);
  const max = Math.ceil((Math.max(...filteredClusterRCA.map(d => d[field] as number)) * 1.1) / 10) * 10;
  const min = Math.min(...filteredClusterRCA.map(d => d[field] as number));
  const scale = scaleLog()
    .domain([min, max])
    .range([ 0, 100 ])
    .nice();
  const numberOfXAxisTicks = tickMarksForMinMax(
    parseFloat(scale.invert(0).toFixed(5)),
    parseFloat(scale.invert(100).toFixed(5)),
  );

  let colorScale: (val: number) => string | undefined;
  if (colorBy === ColorBy.intensity) {
    colorScale = scaleLog()
      .domain([min, max])
      .range(intensityColorRange as any)
      .nice() as any;
  } else if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
    colorScale = scaleLinear()
                  .domain([
                    aggregateIndustryDataMap.data.clusterMinMax.minYearsEducation,
                    aggregateIndustryDataMap.data.clusterMinMax.maxYearsEducation,
                  ])
                  .range(educationColorRange as any) as any;
  } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
    colorScale = scaleLinear()
                  .domain([
                    aggregateIndustryDataMap.data.clusterMinMax.minHourlyWage,
                    aggregateIndustryDataMap.data.clusterMinMax.maxHourlyWage,
                  ])
                  .range(wageColorRange as any) as any;
  } else {
    colorScale = scaleLog()
      .domain([min, max])
      .range(intensityColorRange as any)
      .nice() as any;
  }

  const clusterData = filteredClusterRCA.map(d => {
    const cluster = clusterMap.data[d.clusterId];
    const title = cluster && cluster.name !== null ? cluster.name : d.clusterId;
    let color: string;
    const clusterIndustryDatum = aggregateIndustryDataMap.data.clusters[d.clusterId];
    if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
      if (clusterIndustryDatum) {
        color = colorScale(clusterIndustryDatum.yearsEducation) as string;
      } else {
        color = 'gray';
      }
    } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
      if (clusterIndustryDatum) {
        color = colorScale(clusterIndustryDatum.hourlyWage) as string;
      } else {
        color = 'gray';
      }
    } else {
      const rca = d[field] as number;
      color = colorScale(rca) as string;
    }
    return {
      id: d.clusterId,
      title,
      value: d[field] ? scale(d[field] as number) as number : 0,
      color,
    };
  });
  const formatValue = (value: number) => {
    return parseFloat(scale.invert(value).toFixed(5));
  };

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const {datum, mouseCoords} = e;
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: datum.color,
          rows: [
            [getString('global-intensity') + ':', scale.invert(datum.value).toFixed(3)],
            [getString('global-ui-year') + ':', defaultYear.toString()],
          ],
          boldColumns: [1, 2],
        });
        node.style.top = mouseCoords.y + 'px';
        node.style.left = mouseCoords.x + 'px';
        node.style.display = 'block';
      } else {
        node.style.display = 'none';
      }
    }
  };
  const axisLabel = (
    <BasicLabel>
      {getString('global-intensity')}
      <span style={{pointerEvents: 'all', marginTop: '0.2rem'}}>
        <Tooltip
          explanation={getString('global-intensity-about')}
        />
      </span>
    </BasicLabel>
  );

  return (
    <>
      <VerticalBarChart
        data={clusterData}
        axisLabel={axisLabel}
        formatValue={formatValue}
        onRowHover={setHovered}
        numberOfXAxisTicks={numberOfXAxisTicks}
        centerLineValue={scale(1) as number}
        centerLineLabel={'Expected Specialization'}
        overMideLineLabel={'Over Specialized'}
        underMideLineLabel={'Under Specialized'}
        scrollDownText={'Scroll down to see under specialization'}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default Industries;
