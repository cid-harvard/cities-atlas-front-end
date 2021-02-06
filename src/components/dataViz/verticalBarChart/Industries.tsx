import React, {useState, useRef} from 'react';
import {scaleSymlog} from 'd3-scale';
import {
  BasicLabel,
  sectorColorMap,
} from '../../../styling/styleUtils';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  CompositionType,
  ClassificationNaicsIndustry,
} from '../../../types/graphQL/graphQLTypes';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import useFluent from '../../../hooks/useFluent';
import QuickError from '../../transitionStateComponents/QuickError';
import {rgba} from 'polished';
import Tooltip from './../../general/Tooltip';
import {defaultYear} from '../../../Utils';

interface Props {
  data: SuccessResponse['nodeRca'];
  highlighted: string | undefined;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
}

const Industries = (props: Props) => {
  const {data, highlighted, compositionType, hiddenSectors} = props;

  const industryMap = useGlobalIndustryMap();
  const getString = useFluent();

  const [highlightError, setHighlightError] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredIndustryRCA = data.filter(d => {
    const industry = industryMap.data[d.naicsId];
    if (industry && industry.naicsIdTopParent && !hiddenSectors.includes(industry.naicsIdTopParent.toString())) {
      return d[field] && (d[field] as number) >= 1;
    } else {
      return false;
    }
  });
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
            [getString('global-ui-naics-code') + ':', datum.id],
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

  const highlightErrorPopup = highlightError ? (
    <QuickError
      closeError={() => setHighlightError(false)}
    >
      {getString('global-ui-error-industry-not-in-data-set')}
    </QuickError>
  ) : null;

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
        data={industryData}
        axisLabel={axisLabel}
        formatValue={formatValue}
        highlighted={highlighted}
        onRowHover={setHovered}
        onHighlightError={() => setHighlightError(true)}
      />
      <RapidTooltipRoot ref={tooltipRef} />
      {highlightErrorPopup}
    </>
  );
};

export default Industries;
