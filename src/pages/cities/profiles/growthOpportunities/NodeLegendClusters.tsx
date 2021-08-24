import React from 'react';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {defaultYear, formatNumberLong} from '../../../../Utils';
import {extent} from 'd3-array';
import {
  DigitLevel,
  ClusterLevel,
} from '../../../../types/graphQL/graphQLTypes';
import {
  NodeSizing,
} from '../../../../routing/routes';
import NodeLegend from '../../../../components/dataViz/legend/NodeLegend';
import useClusterRCAData from '../../../../hooks/useClusterRCAData';

interface Props {
  clusterLevel: ClusterLevel;
  nodeSizing: NodeSizing;
}

const NodeLegendIndustries = (props: Props) => {
  const {
    nodeSizing, clusterLevel,
  } = props;
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Sector, year: defaultYear, clusterLevel,
  });
  const {data: rcaData} = useClusterRCAData(clusterLevel);

  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (aggregateIndustryDataMap.data && !aggregateIndustryDataMap.loading) {
    if (nodeSizing === NodeSizing.globalCompanies) {
      nodeSizingTitle = 'Node Size by Global Number of Establishments';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.clusterMinMax.minSumNumCompany);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.clusterMinMax.maxSumNumCompany);
    } else if (nodeSizing === NodeSizing.globalEmployees) {
      nodeSizingTitle = 'Node Size by Global Number of Employees';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.clusterMinMax.minSumNumEmploy);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.clusterMinMax.maxSumNumEmploy);
    } if (nodeSizing === NodeSizing.cityCompanies && rcaData) {
      nodeSizingTitle = 'Node Size by Number of Establishments in City';
      const [min, max] = extent(rcaData.clusterData
        .filter(d => d.level === clusterLevel)
        .map(d => d.numCompany).filter(d => d !== null) as number []);
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.cityEmployees && rcaData) {
      nodeSizingTitle = 'Node Size by Number of Employees in City';
      const [min, max] = extent(rcaData.clusterData
        .filter(d => d.level === clusterLevel)
        .map(d => d.numEmploy).filter(d => d !== null) as number []);
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.rca && rcaData) {
      nodeSizingTitle = 'Node Size by Relative Presence';
      const [min, max] = extent(rcaData.clusterRca.map(d => d.rca).filter(d => d !== null) as number []);
      nodeSizingMinText = Math.floor(min ? min : 0) + 'x expected presence';
      nodeSizingMaxText = Math.ceil(max ? max : 0) + 'x expected presence';
    }
  }

  return (
    <NodeLegend
      sizeBy={nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle ? {
          title: nodeSizingTitle,
          minLabel: nodeSizingMinText,
          maxLabel: nodeSizingMaxText,
        } : null
      }
      colorBy={null}
    />
  );
};

export default NodeLegendIndustries;
