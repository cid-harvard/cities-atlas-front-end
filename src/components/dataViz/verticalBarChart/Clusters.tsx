import React, {useRef} from 'react';
import {scaleLog, scaleLinear} from 'd3-scale';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  DigitLevel,
  ClassificationNaicsCluster,
} from '../../../types/graphQL/graphQLTypes';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import useFluent from '../../../hooks/useFluent';
import Tooltip from './../../general/Tooltip';
import {defaultYear} from '../../../Utils';
import {
  BasicLabel,
  clusterColorMap,
  intensityColorRange,
  educationColorRange,
  wageColorRange,
} from '../../../styling/styleUtils';
import {ClusterLevel, ColorBy} from '../../../routing/routes';
import {
  useGlobalClusterMap,
} from '../../../hooks/useGlobalClusterData';
import {tickMarksForMinMax} from './getNiceLogValues';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';
import {rgba} from 'polished';
import useCurrentBenchmark from '../../../hooks/useCurrentBenchmark';

interface Props {
  data: SuccessResponse['c3Rca'] | SuccessResponse['c1Rca'];
  clusterLevel: ClusterLevel;
  colorBy: ColorBy;
  hiddenClusters: ClassificationNaicsCluster['id'][];
}

const Industries = (props: Props) => {
  const {data, clusterLevel, colorBy, hiddenClusters} = props;
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const getString = useFluent();
  const clusterMap = useGlobalClusterMap();
  const { benchmarkNameShort } = useCurrentBenchmark();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Six, year: defaultYear, clusterLevel: parseInt(clusterLevel, 10),
  });

  const filteredClusterRCA = data.filter(d => {
    const cluster = d.clusterId !== null ? clusterMap.data[d.clusterId] : undefined;
    const clusterIdTopParent = cluster && cluster.clusterIdTopParent ? cluster.clusterIdTopParent : '';
    if (cluster && !hiddenClusters.includes(clusterIdTopParent.toString())) {
      return d.rca && (d.rca as number) > 0;
    } else {
      return false;
    }
  });

  let max = Math.ceil((Math.max(...filteredClusterRCA.map(d => d.rca as number)) * 1.1) / 10) * 10;
  let min = Math.min(...filteredClusterRCA.map(d => d.rca as number));
  if (max < 10) {
    max = 10;
  }
  if (min >= 1) {
    min = 0.1;
  }
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
    const cluster = d.clusterId !== null ? clusterMap.data[d.clusterId] : undefined;
    const title = cluster && cluster.name !== null ? cluster.name : '';
    let color: string;
    const clusterIndustryDatum = d.clusterId !== null
      ? aggregateIndustryDataMap.data.clusters[d.clusterId] : undefined;
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
    } else if (colorBy === ColorBy.intensity) {
      const rca = d.rca as number;
      color = colorScale(rca) as string;
    } else {
      const colorDatum = clusterColorMap
        .find(s => cluster && cluster.clusterIdTopParent && s.id === cluster.clusterIdTopParent.toString());
      color = colorDatum ? colorDatum.color : 'lightgray';
    }
    return {
      id: d.clusterId !== null ? d.clusterId.toString() : '',
      title,
      value: d.rca ? scale(d.rca as number) as number : 0,
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
          color: rgba(datum.color, 0.3),
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
      {getString('global-intensity')}: {benchmarkNameShort}
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
