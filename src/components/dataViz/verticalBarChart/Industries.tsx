import React, {useState, useRef} from 'react';
import {scaleLog} from 'd3-scale';
import {
  BasicLabel,
  sectorColorMap,
  educationColorRange,
  wageColorRange,
} from '../../../styling/styleUtils';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  CompositionType,
  ClassificationNaicsIndustry,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {
  ColorBy,
} from '../../../routing/routes';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import useFluent from '../../../hooks/useFluent';
import QuickError from '../../transitionStateComponents/QuickError';
import {rgba} from 'polished';
import Tooltip from './../../general/Tooltip';
import {defaultYear} from '../../../Utils';
import {tickMarksForMinMax} from './getNiceLogValues';
import {scaleLinear} from 'd3-scale';
import useColorByIntensity from '../treeMap/useColorByIntensity';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';

interface Props {
  data: SuccessResponse['nodeRca'];
  highlighted: string | undefined;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  colorBy: ColorBy;
  digitLevel: DigitLevel;
}

const Industries = (props: Props) => {
  const {
    data, highlighted, compositionType, hiddenSectors,
    colorBy, digitLevel,
  } = props;

  const industryMap = useGlobalIndustryMap();
  const intensity = useColorByIntensity({digitLevel, colorBy, compositionType});
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: digitLevel, year: defaultYear});
  const getString = useFluent();

  let colorScale: (val: number) => string;
  if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
    colorScale = scaleLinear()
                  .domain([
                    aggregateIndustryDataMap.data.globalMinMax.minYearsEducation,
                    aggregateIndustryDataMap.data.globalMinMax.maxYearsEducation,
                  ])
                  .range(educationColorRange as any) as any;
  } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
    colorScale = scaleLinear()
                  .domain([
                    aggregateIndustryDataMap.data.globalMinMax.minHourlyWage,
                    aggregateIndustryDataMap.data.globalMinMax.maxHourlyWage,
                  ])
                  .range(wageColorRange as any) as any;
  } else {
    colorScale = () => 'lightgray';
  }

  const [highlightError, setHighlightError] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const field = compositionType === CompositionType.Employees ? 'rcaNumEmploy' : 'rcaNumCompany';

  const filteredIndustryRCA = data.filter(d => {
    const industry = industryMap.data[d.naicsId];
    if (industry && !hiddenSectors.includes(industry.naicsIdTopParent.toString())) {
      return d[field] && (d[field] as number) > 0;
    } else {
      return false;
    }
  });
  let max = Math.ceil((Math.max(...filteredIndustryRCA.map(d => d[field] as number)) * 1.1) / 10) * 10;
  let min = Math.min(...filteredIndustryRCA.map(d => d[field] as number));
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
  const industryData = filteredIndustryRCA.map(d => {
    const industry = industryMap.data[d.naicsId];
    let color: string;
    if (intensity && intensity.industries) {
      const industryIntesity = intensity.industries.find(dd => d.naicsId === dd.naicsId);
      if (industryIntesity) {
        color = industryIntesity.fill;
      } else {
        color = 'lightgray';
      }
    } else if ((colorBy === ColorBy.education|| colorBy === ColorBy.wage) && aggregateIndustryDataMap.data) {
      const target = aggregateIndustryDataMap.data.industries[d.naicsId];
      if (target) {
        const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
        color = colorScale(targetValue);
      } else {
        color = 'lightgray';
      }
    } else {
      const colorDatum = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
      color = colorDatum ? colorDatum.color : 'lightgray';
    }
    return {
      id: d.naicsId,
      title: industry && industry.name ? industry.name : '',
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
        numberOfXAxisTicks={numberOfXAxisTicks}
        centerLineValue={scale(1) as number}
        centerLineLabel={getString('global-specialization-expected')}
        overMideLineLabel={getString('global-specialization-over')}
        underMideLineLabel={getString('global-specialization-under')}
        scrollDownText={getString('global-specialization-scroll')}
      />
      <RapidTooltipRoot ref={tooltipRef} />
      {highlightErrorPopup}
    </>
  );
};

export default Industries;
