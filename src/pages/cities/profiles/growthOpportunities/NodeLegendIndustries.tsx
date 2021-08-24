import React from 'react';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {defaultYear, formatNumberLong} from '../../../../Utils';
import {extent} from 'd3-array';
import {
  DigitLevel,
} from '../../../../types/graphQL/graphQLTypes';
import {
  NodeSizing,
} from '../../../../routing/routes';
import NodeLegend from '../../../../components/dataViz/legend/NodeLegend';
import useRCAData from '../../../../hooks/useRCAData';

interface Props {
  digitLevel: DigitLevel;
  nodeSizing: NodeSizing;
}

const NodeLegendIndustries = (props: Props) => {
  const {
    digitLevel, nodeSizing,
  } = props;
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: digitLevel, year: defaultYear});
  const {data: rcaData} = useRCAData(digitLevel);

  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (aggregateIndustryDataMap.data && !aggregateIndustryDataMap.loading) {
    if (nodeSizing === NodeSizing.globalCompanies) {
      nodeSizingTitle = 'Node Size by Global Number of Establishments';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.minSumNumCompany);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.maxSumNumCompany);
    } else if (nodeSizing === NodeSizing.globalEmployees) {
      nodeSizingTitle = 'Node Size by Global Number of Employees';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.minSumNumEmploy);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.maxSumNumEmploy);
    } if (nodeSizing === NodeSizing.cityCompanies && rcaData) {
      nodeSizingTitle = 'Node Size by Number of Establishments in City';
      const [min, max] = extent(rcaData.naicsData.map(d => d.numCompany).filter(d => d !== null) as number []);
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.cityEmployees && rcaData) {
      nodeSizingTitle = 'Node Size by Number of Employees in City';
      const [min, max] = extent(rcaData.naicsData.map(d => d.numEmploy).filter(d => d !== null) as number []);
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.rca && rcaData) {
      nodeSizingTitle = 'Node Size by Relative Presence';
      const [min, max] = extent(rcaData.naicsRca.map(d => d.rca).filter(d => d !== null) as number []);
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
