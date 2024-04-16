import React, { useState, useRef } from "react";
import { scaleLog } from "d3-scale";
import {
  sectorColorMap,
  educationColorRange,
  wageColorRange,
  Mult,
  FractionMult,
} from "../../../styling/styleUtils";
import ComparisonBarChart, {
  RowHoverEvent,
  BarDatum,
  Direction,
} from "react-comparison-bar-chart";
import { SuccessResponse } from "../industrySpace/chart/useRCAData";
import { useGlobalIndustryMap } from "../../../hooks/useGlobalIndustriesData";
import {
  ClassificationNaicsIndustry,
  DigitLevel,
} from "../../../types/graphQL/graphQLTypes";
import { ColorBy } from "../../../routing/routes";
import {
  getStandardTooltip,
  RapidTooltipRoot,
} from "../../../utilities/rapidTooltip";
import useFluent from "../../../hooks/useFluent";
import QuickError from "../../transitionStateComponents/QuickError";
import { rgba } from "polished";
import { defaultYear, decimalToFraction } from "../../../Utils";
import { tickMarksForMinMax } from "./getNiceLogValues";
import { scaleLinear } from "d3-scale";
import { useAggregateIndustryMap } from "../../../hooks/useAggregateIndustriesData";
import LoadingBlock from "../../transitionStateComponents/VizLoadingBlock";

interface Props {
  data: SuccessResponse["naicsRca"];
  highlighted: string | undefined;
  hiddenSectors: ClassificationNaicsIndustry["id"][];
  colorBy: ColorBy;
  digitLevel: DigitLevel;
}

const Industries = (props: Props) => {
  const { data, highlighted, hiddenSectors, colorBy, digitLevel } = props;

  const industryMap = useGlobalIndustryMap();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: digitLevel,
    year: defaultYear,
  });
  const getString = useFluent();

  let colorScale: (val: number) => string;
  if (
    colorBy === ColorBy.education &&
    aggregateIndustryDataMap.data !== undefined
  ) {
    colorScale = scaleLinear()
      .domain([
        aggregateIndustryDataMap.data.globalMinMax.minYearsEducation,
        aggregateIndustryDataMap.data.globalMinMax.medianYearsEducation,
        aggregateIndustryDataMap.data.globalMinMax.maxYearsEducation,
      ])
      .range(educationColorRange as any) as any;
  } else if (
    colorBy === ColorBy.wage &&
    aggregateIndustryDataMap.data !== undefined
  ) {
    colorScale = scaleLinear()
      .domain([
        aggregateIndustryDataMap.data.globalMinMax.minHourlyWage,
        aggregateIndustryDataMap.data.globalMinMax.medianHourlyWage,
        aggregateIndustryDataMap.data.globalMinMax.maxHourlyWage,
      ])
      .range(wageColorRange as any) as any;
  } else {
    colorScale = () => "lightgray";
  }

  const [highlightError, setHighlightError] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  if (
    (colorBy === ColorBy.education && aggregateIndustryDataMap.loading) ||
    (colorBy === ColorBy.wage && aggregateIndustryDataMap.loading)
  ) {
    return <LoadingBlock />;
  }

  const filteredIndustryRCA = data.filter((d) => {
    const industry =
      d.naicsId !== null ? industryMap.data[d.naicsId] : undefined;
    if (
      industry &&
      !hiddenSectors.includes(industry.naicsIdTopParent.toString())
    ) {
      return d.rca && (d.rca as number) > 0;
    } else {
      return false;
    }
  });
  let max =
    Math.ceil(
      (Math.max(...filteredIndustryRCA.map((d) => d.rca as number)) * 1.1) / 10,
    ) * 10;
  let min = Math.min(...filteredIndustryRCA.map((d) => d.rca as number));
  if (max < 10) {
    max = 10;
  }
  if (min >= 1) {
    min = 0.1;
  }
  let scale = scaleLog().domain([min, max]).range([0, 100]).nice();

  min = parseFloat(scale.invert(0).toFixed(5));
  max = parseFloat(scale.invert(100).toFixed(5));

  if (max.toString().length > min.toString().length - 1) {
    min = 1 / max;
  } else if (max.toString().length < min.toString().length - 1) {
    max = 1 / min;
  }

  scale = scaleLog().domain([min, max]).range([0, 100]).nice();
  const numberOfXAxisTicks = tickMarksForMinMax(
    parseFloat(scale.invert(0).toFixed(5)),
    parseFloat(scale.invert(100).toFixed(5)),
  );

  const highPresenceScale = scaleLog().domain([1, max]).range([0, 100]).nice();

  const lowPresenceScale = scaleLog().domain([1, min]).range([0, 100]).nice();

  const highPresenceData: BarDatum[] = [];
  const lowPresenceData: BarDatum[] = [];
  filteredIndustryRCA.forEach((d) => {
    const industry =
      d.naicsId !== null ? industryMap.data[d.naicsId] : undefined;
    let color: string;
    if (
      (colorBy === ColorBy.education || colorBy === ColorBy.wage) &&
      aggregateIndustryDataMap.data
    ) {
      const target =
        d.naicsId !== null
          ? aggregateIndustryDataMap.data.industries[d.naicsId]
          : undefined;
      if (target) {
        const targetValue =
          colorBy === ColorBy.education
            ? target.yearsEducationRank
            : target.hourlyWageRank;
        color = colorScale(targetValue);
      } else {
        color = "lightgray";
      }
    } else {
      const colorDatum = industry
        ? sectorColorMap.find(
            (s) => s.id === industry.naicsIdTopParent.toString(),
          )
        : undefined;
      color = colorDatum ? colorDatum.color : "lightgray";
    }
    let value: number = 0;
    if (d.rca && d.rca < 1) {
      value = lowPresenceScale(d.rca) as number;
    } else if (d.rca && d.rca >= 1) {
      value = highPresenceScale(d.rca) as number;
    }
    // const value = d.rca ? scale(d.rca as number) as number : 0;
    const datum: BarDatum = {
      id: d.naicsId !== null ? d.naicsId.toString() : "",
      title: industry && industry.name ? industry.name : "",
      value,
      color,
    };
    if (d.rca && d.rca >= 1) {
      highPresenceData.push(datum);
    } else {
      lowPresenceData.push(datum);
    }
  });
  const formatValue = (value: number, direction: Direction) => {
    const scaleToUse =
      direction === Direction.Over ? highPresenceScale : lowPresenceScale;
    const scaledValue = parseFloat(scaleToUse.invert(value).toFixed(5));
    if (scaledValue >= 1) {
      return (
        <>
          {scaledValue}
          <Mult>×</Mult>
        </>
      );
    } else {
      const { top, bottom } = decimalToFraction(scaledValue);
      return (
        <>
          <sup>{top}</sup>&frasl;<sub>{bottom}</sub>
          <FractionMult>×</FractionMult>
        </>
      );
    }
  };

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const { datum, mouseCoords } = e;
        const industry = filteredIndustryRCA.find(
          (d) => d.naicsId && d.naicsId.toString() === datum.id,
        );
        const rows = [
          [getString("global-ui-naics-code") + ":", datum.id],
          [getString("global-ui-year") + ":", defaultYear.toString()],
          [
            getString("global-intensity") + ":",
            industry && industry.rca ? industry.rca.toFixed(3) : "0.000",
          ],
        ];
        if (
          (colorBy === ColorBy.education || colorBy === ColorBy.wage) &&
          aggregateIndustryDataMap.data
        ) {
          const target = aggregateIndustryDataMap.data.industries[datum.id];
          const targetValue =
            colorBy === ColorBy.education
              ? target.yearsEducation
              : target.hourlyWage;
          rows.push([
            getString("global-formatted-color-by", { type: colorBy }),
            (colorBy === ColorBy.wage ? "$" : "") + targetValue.toFixed(2),
          ]);
        }
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows,
          boldColumns: [1, 2],
        });
        node.style.top = mouseCoords.y + "px";
        node.style.left = mouseCoords.x + "px";
        node.style.display = "block";
      } else {
        node.style.display = "none";
      }
    }
  };

  const highlightErrorPopup = highlightError ? (
    <QuickError closeError={() => setHighlightError(false)}>
      {getString("global-ui-error-industry-not-in-data-set")}
    </QuickError>
  ) : null;

  return (
    <>
      <ComparisonBarChart
        primaryData={highPresenceData}
        secondaryData={lowPresenceData}
        formatValue={formatValue}
        highlighted={highlighted}
        onRowHover={setHovered}
        onHighlightError={() => setHighlightError(true)}
        nValuesToShow={10}
        numberOfXAxisTicks={numberOfXAxisTicks}
        expandCollapseText={{
          toExpand: getString("cities-top-10-comparison-chart-expand"),
          toCollapse: getString("cities-top-10-comparison-chart-collapse"),
        }}
      />
      <RapidTooltipRoot ref={tooltipRef} />
      {highlightErrorPopup}
    </>
  );
};

export default Industries;
