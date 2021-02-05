import React from 'react';
import {scaleSymlog} from 'd3-scale';
import {
  sectorColorMap,
} from '../../../styling/styleUtils';
import VerticalBarChart from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';

interface Props {
  data: SuccessResponse['nodeRca'];
  highlighted: string | undefined;
  compositionType: CompositionType;
}

const Industries = (props: Props) => {
  const {data, highlighted, compositionType} = props;

  const industryMap = useGlobalIndustryMap();

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredIndustryRCA = data.filter(d => d[field] && (d[field] as number) >= 1);
  const max = Math.ceil((Math.max(...filteredIndustryRCA.map(d => d[field] as number)) * 1.1) / 10) * 10;
  const scale = scaleSymlog()
    .domain([1, max])
    .range([ 0, 100 ]);
  const industryData = filteredIndustryRCA.map(d => {
    const industry = industryMap.data[d.naicsId];
    const colorDatum = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
    return {
      id: d.naicsId,
      title: industry && industry.name ? industry.name : '',
      value: d[field] ? scale(d[field] as number) as number : 0,
      color: colorDatum ? colorDatum.color : 'gray',
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
      highlighted={highlighted}
    />
  );
};

export default Industries;
