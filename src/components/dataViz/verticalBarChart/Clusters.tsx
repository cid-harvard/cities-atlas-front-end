import React from 'react';
import {scaleSymlog} from 'd3-scale';
import VerticalBarChart from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {intensityColorRange} from '../../../styling/styleUtils';

interface Props {
  data: SuccessResponse['clusterRca'];
  compositionType: CompositionType;
}

const Industries = (props: Props) => {
  const {data, compositionType} = props;

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredIndustryRCA = data.filter(d => d[field] && (d[field] as number) >= 1);
  const max = Math.ceil((Math.max(...filteredIndustryRCA.map(d => d[field] as number)) * 1.1) / 10) * 10;
  const scale = scaleSymlog()
    .domain([1, max])
    .range([ 0, 100 ]);
  const colorScale = scaleSymlog()
    .domain([1, max])
    .range(intensityColorRange as any);
  const industryData = filteredIndustryRCA.map(d => {
    return {
      id: d.clusterId,
      title: d.clusterId,
      value: d[field] ? scale(d[field] as number) as number : 0,
      color: d[field] ? colorScale(d[field] as number) as unknown as string : intensityColorRange[0],
    };
  });
  const formatValue = (value: number) => {
    return parseFloat(scale.invert(value).toFixed(2));
  };

  return (
    <VerticalBarChart
      data={industryData}
      axisLabel={'Specialization'}
      formatValue={formatValue}
    />
  );
};

export default Industries;
