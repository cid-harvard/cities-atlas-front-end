import React, {useRef} from 'react';
import {scaleLog} from 'd3-scale';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {intensityColorRange} from '../../../styling/styleUtils';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import useFluent from '../../../hooks/useFluent';
import Tooltip from './../../general/Tooltip';
import {defaultYear} from '../../../Utils';
import {
  BasicLabel,
} from '../../../styling/styleUtils';
import {ClusterLevel} from '../../../routing/routes';
// import {
//   useGlobalClusterMap,
// } from '../../../hooks/useGlobalClusterData';
import useLayoutData from '../industrySpace/chart/useLayoutData';
import niceLogValues from './getNiceLogValues';

interface Props {
  data: SuccessResponse['clusterRca'];
  compositionType: CompositionType;
  clusterLevel: ClusterLevel;
}

const Industries = (props: Props) => {
  const {data, compositionType, clusterLevel} = props;
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const getString = useFluent();
  // const clusterMap = useGlobalClusterMap();

  //  Temporary solution for getting cluster names until API has been updated
  const {data: layoutData} = useLayoutData();

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredClusterRCA = data.filter(d => clusterLevel === (d.level as number).toString() && d[field] && (d[field] as number) >= 1);
  const max = Math.ceil((Math.max(...filteredClusterRCA.map(d => d[field] as number)) * 1.1) / 10) * 10;
  const {logValue, numberOfXAxisTicks} = niceLogValues(max);
  const scale = scaleLog()
    .domain([1, logValue])
    .range([ 0, 100 ])
    .base(2);
  const colorScale = scaleLog()
    .domain([1, max])
    .range(intensityColorRange as any)
    .base(2);
  const clusterData = filteredClusterRCA.map(d => {
    // const cluster = clusterMap.data[d.clusterId];
    // const title = cluster && cluster.name !== null ? cluster.name : d.clusterId;
    // temp mapping to name from local json
    let title = '';
    if (layoutData && layoutData.clusters) {
      if (clusterLevel === ClusterLevel.C1) {
        const namedCluster = layoutData.clusters.continents.find(c => c.clusterId === d.clusterId);
        if (namedCluster) {
          title = namedCluster.name;
        }
      } else if (clusterLevel === ClusterLevel.C3) {
        const namedCluster = layoutData.clusters.countries.find(c => c.clusterId === d.clusterId);
        if (namedCluster) {
          title = namedCluster.name;
        }
      }
    }
    return {
      id: d.clusterId,
      title,
      value: d[field] ? scale(d[field] as number) as number : 0,
      color: d[field] ? colorScale(d[field] as number) as unknown as string : intensityColorRange[0],
    };
  });
  const formatValue = (value: number) => {
    return parseFloat(scale.invert(value).toFixed(2));
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
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default Industries;
