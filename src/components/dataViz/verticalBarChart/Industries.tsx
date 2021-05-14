import React, {useState, useRef} from 'react';
import {scaleLog} from 'd3-scale';
import {
  BasicLabel,
  BasicLabelBackground,
  sectorColorMap,
  educationColorRange,
  wageColorRange,
  Mult,
  FractionMult,
} from '../../../styling/styleUtils';
import VerticalBarChart, {RowHoverEvent} from 'react-vertical-bar-chart';
import {SuccessResponse} from '../industrySpace/chart/useRCAData';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
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
import {defaultYear, decimalToFraction} from '../../../Utils';
import {tickMarksForMinMax} from './getNiceLogValues';
import {scaleLinear} from 'd3-scale';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';
import useCurrentBenchmark from '../../../hooks/useCurrentBenchmark';
import LoadingBlock from '../../transitionStateComponents/VizLoadingBlock';

interface Props {
  data: SuccessResponse['naicsRca'];
  highlighted: string | undefined;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  colorBy: ColorBy;
  digitLevel: DigitLevel;
}

const Industries = (props: Props) => {
  const {
    data, highlighted, hiddenSectors,
    colorBy, digitLevel,
  } = props;

  const industryMap = useGlobalIndustryMap();
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: digitLevel, year: defaultYear});
  const getString = useFluent();
  const { benchmarkNameShort } = useCurrentBenchmark();

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

  if ((colorBy === ColorBy.education && aggregateIndustryDataMap.loading) ||
      (colorBy === ColorBy.wage && aggregateIndustryDataMap.loading)) {
    return <LoadingBlock />;
  }

  const filteredIndustryRCA = data.filter(d => {
    const industry = d.naicsId !== null ? industryMap.data[d.naicsId] : undefined;
    if (industry && !hiddenSectors.includes(industry.naicsIdTopParent.toString())) {
      return d.rca && (d.rca as number) > 0;
    } else {
      return false;
    }
  });
  let max = Math.ceil((Math.max(...filteredIndustryRCA.map(d => d.rca as number)) * 1.1) / 10) * 10;
  let min = Math.min(...filteredIndustryRCA.map(d => d.rca as number));
  if (max < 10) {
    max = 10;
  }
  if (min >= 1) {
    min = 0.1;
  }
  let scale = scaleLog()
    .domain([min, max])
    .range([ 0, 100 ])
    .nice();

  min = parseFloat(scale.invert(0).toFixed(5));
  max = parseFloat(scale.invert(100).toFixed(5));

  if (max.toString().length > min.toString().length - 1) {
    min = 1 / max;
  } else if (max.toString().length < min.toString().length - 1) {
    max = 1 / min;
  }

  scale = scaleLog()
    .domain([min, max])
    .range([ 0, 100 ])
    .nice();
  const numberOfXAxisTicks = tickMarksForMinMax(
    parseFloat(scale.invert(0).toFixed(5)),
    parseFloat(scale.invert(100).toFixed(5)),
  );
  const industryData = filteredIndustryRCA.map(d => {
    const industry = d.naicsId !== null ? industryMap.data[d.naicsId] : undefined;
    let color: string;
    if ((colorBy === ColorBy.education|| colorBy === ColorBy.wage) && aggregateIndustryDataMap.data) {
      const target = d.naicsId !== null ? aggregateIndustryDataMap.data.industries[d.naicsId] : undefined;
      if (target) {
        const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
        color = colorScale(targetValue);
      } else {
        color = 'lightgray';
      }
    } else {
      const colorDatum = industry
        ? sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString()) : undefined;
      color = colorDatum ? colorDatum.color : 'lightgray';
    }
    return {
      id: d.naicsId !== null ? d.naicsId.toString() : '',
      title: industry && industry.name ? industry.name : '',
      value: d.rca ? scale(d.rca as number) as number : 0,
      color,
    };
  });
  const formatValue = (value: number) => {
    const scaledValue = parseFloat(scale.invert(value).toFixed(5));
    if (scaledValue >= 1) {
      return <>{scaledValue}<Mult>×</Mult></>;
    } else {
      const {top, bottom} = decimalToFraction(scaledValue);
      return <><sup>{top}</sup>&frasl;<sub>{bottom}</sub><FractionMult>×</FractionMult></>;
    }
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
            [getString('global-ui-naics-code') + ':', datum.id],
            [getString('global-ui-year') + ':', defaultYear.toString()],
            [getString('global-intensity') + ':', scale.invert(datum.value).toFixed(3)],
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
      <BasicLabelBackground>
        {getString('global-intensity')}: {benchmarkNameShort}
      </BasicLabelBackground>
      <span style={{pointerEvents: 'all', marginTop: '0.2rem'}}>
        <Tooltip
          explanation={getString('global-intensity-bar-graph-about')}
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
