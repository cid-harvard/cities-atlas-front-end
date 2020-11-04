import React, {useRef, useState} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
} from 'react-comparison-bar-chart';
import {rgba} from 'polished';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';
import useFluent from '../../../hooks/useFluent';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import {
  CityIndustryYear,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import QuickError from '../../transitionStateComponents/QuickError';

export interface FilteredDatum {
  id: CityIndustryYear['naicsId'];
  title: string;
  value: number;
  color: string;
  naicsIdTopParent: CityIndustryYear['naicsId'];
}

const formatAxisValue = (value: number) => {
  return parseFloat((value).toFixed(1)) + '%';
};

interface Props {
  filteredPrimaryData: FilteredDatum[];
  filteredSecondaryData: FilteredDatum[];
  primaryTotal: number;
  secondaryTotal: number;
  primaryCityId: number;
  secondaryCityId: number;
  highlighted: string | undefined;
  compositionType: CompositionType;
}

const Chart = (props: Props) => {
  const {
    filteredPrimaryData, filteredSecondaryData,
    primaryTotal, secondaryTotal,
    primaryCityId, secondaryCityId,
    highlighted, compositionType,
  } = props;

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const {data: globalData} = useGlobalLocationData();
  const getString = useFluent();

  const [highlightError, setHighlightError] = useState<boolean>(false);

  const primaryData: BarDatum[] = [];
  const secondaryData: BarDatum[] = [];
    filteredPrimaryData.forEach(d => {
      const secondaryDatum = filteredSecondaryData.find(d2 => d2.id === d.id);
      const primaryShare = d.value / primaryTotal;
      const secondaryShare = secondaryDatum ? secondaryDatum.value / secondaryTotal : 0;
      const difference = primaryShare - secondaryShare;
      if (difference > 0) {
        primaryData.push({...d, value: difference * 100});
      }
    });
    filteredSecondaryData.forEach(d => {
      const primaryDatum = filteredPrimaryData.find(d2 => d2.id === d.id);
      const secondaryShare = d.value / secondaryTotal;
      const primaryShare = primaryDatum ? primaryDatum.value / primaryTotal : 0;
      const difference = secondaryShare - primaryShare;
      if (difference > 0) {
        secondaryData.push({...d, value: difference * 100});
      }
    });

  const primaryCityDatum = globalData
    ? globalData.cities.find(c => parseInt(c.cityId, 10) === primaryCityId) : undefined;
  const primaryCityName = primaryCityDatum && primaryCityDatum.name? primaryCityDatum.name : '';

  const secondaryCityDatum = globalData
    ? globalData.cities.find(c => parseInt(c.cityId, 10) === secondaryCityId) : undefined;
  const secondaryCityName = secondaryCityDatum && secondaryCityDatum.name ? secondaryCityDatum.name : '';

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const {datum, mouseCoords} = e;
        const primaryDatum = filteredPrimaryData.find(d => d.id === datum.id);
        const secondaryDatum = filteredSecondaryData.find(d => d.id === datum.id);
        // const secondaryValue = secondaryDatum ? secondaryDatum.value / secondaryTotal * 100 : 0;
        // const primaryValue = primaryDatum ? primaryDatum.value / primaryTotal * 100 : 0;
        // const primaryDiff = primaryValue > secondaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
        // const secondaryDiff = secondaryValue > primaryValue ? '+' + datum.value.toFixed(2) + '%' : '';

        const primaryValue = primaryDatum ? primaryDatum.value / primaryTotal * 100: 0;
        const secondaryValue = secondaryDatum ? secondaryDatum.value / secondaryTotal * 100 : 0;
        const primaryValueText = primaryValue === 0 || primaryValue >= 0.01
          ? primaryValue.toFixed(2) + '%' : '<0.01%';
        const secondaryValueText = secondaryValue === 0 || secondaryValue >= 0.01
          ? secondaryValue.toFixed(2) + '%' : '<0.01%';
        const primaryDiff = primaryValue - secondaryValue;
        const secondaryDiff = secondaryValue - primaryValue;
        let primaryDiffValue: string;
        if (primaryDiff < 0) {
          primaryDiffValue = '';
        } else if (primaryDiff < 0.01) {
          primaryDiffValue = '+<0.01%';
        } else {
          primaryDiffValue = '+' + primaryDiff.toFixed(2) + '%';
        }
        let secondaryDiffValue: string;
        if (secondaryDiff < 0) {
          secondaryDiffValue = '';
        } else if (secondaryDiff < 0.01) {
          secondaryDiffValue = '+<0.01%';
        } else {
          secondaryDiffValue = '+' + secondaryDiff.toFixed(2) + '%';
        }


        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows: [
            ['', secondaryCityName, primaryCityName],
            [
              getString('tooltip-text-share-of', {value: compositionType}),
              secondaryValueText,
              primaryValueText,
            ],
            ['Difference', secondaryDiffValue, primaryDiffValue],
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

  const titleFormatter = (label: string, count: number, max: number) => {
    const countText = count === max ? '' : getString('cities-top-10-comparison-chart-title-count-text', {count});
    return getString('cities-top-10-comparison-chart-title', {name: label}) + ' ' + countText;
  };

  const highlightErrorPopup = highlightError ? (
    <QuickError
      closeError={() => setHighlightError(false)}
    >
      The selected industry is not in the current data set
    </QuickError>
  ) : null;

  return (
    <>
      <ComparisonBarChart
        primaryData={primaryData}
        secondaryData={secondaryData}
        nValuesToShow={10}
        formatValue={formatAxisValue}
        titles={{
          primary: primaryCityName,
          secondary: secondaryCityName,
          format: titleFormatter,
        }}
        expandCollapseText={{
          toExpand: getString('cities-top-10-comparison-chart-expand'),
          toCollapse: getString('cities-top-10-comparison-chart-collapse'),
        }}
        axisLabel={getString('cities-top-10-comparison-chart-axis-title')}
        onRowHover={setHovered}
        highlighted={highlighted}
        onHighlightError={() => setHighlightError(true)}
      />
      <RapidTooltipRoot ref={tooltipRef} />
      {highlightErrorPopup}
    </>
  );
};

export default React.memo(Chart);
