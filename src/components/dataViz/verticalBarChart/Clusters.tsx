import React, { useRef, useState } from "react";
import { scaleLog, scaleLinear } from "d3-scale";
import ComparisonBarChart, {
  RowHoverEvent,
  BarDatum,
  Direction,
} from "react-comparison-bar-chart";
import { SuccessResponse } from "../industrySpace/chart/useRCAData";
import {
  DigitLevel,
  ClassificationNaicsCluster,
} from "../../../types/graphQL/graphQLTypes";
import {
  getStandardTooltip,
  RapidTooltipRoot,
} from "../../../utilities/rapidTooltip";
import useFluent from "../../../hooks/useFluent";
import { defaultYear, decimalToFraction } from "../../../Utils";
import {
  clusterColorMap,
  intensityColorRange,
  educationColorRange,
  wageColorRange,
  Mult,
  FractionMult,
} from "../../../styling/styleUtils";
import { ClusterLevel, ColorBy } from "../../../routing/routes";
import { useGlobalClusterMap } from "../../../hooks/useGlobalClusterData";
import { tickMarksForMinMax } from "./getNiceLogValues";
import { useAggregateIndustryMap } from "../../../hooks/useAggregateIndustriesData";
import { rgba } from "polished";
import LoadingBlock from "../../transitionStateComponents/VizLoadingBlock";
import QuickError from "../../transitionStateComponents/QuickError";

interface Props {
  data: SuccessResponse["c3Rca"] | SuccessResponse["c1Rca"];
  clusterLevel: ClusterLevel;
  colorBy: ColorBy;
  highlighted: string | undefined;
  hiddenClusters: ClassificationNaicsCluster["id"][];
}

const Clusters = (props: Props) => {
  const { data, clusterLevel, colorBy, hiddenClusters, highlighted } = props;
  const [highlightError, setHighlightError] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const getString = useFluent();
  const clusterMap = useGlobalClusterMap();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Six,
    year: defaultYear,
    clusterLevel: parseInt(clusterLevel, 10),
  });

  if (
    (colorBy === ColorBy.education && aggregateIndustryDataMap.loading) ||
    (colorBy === ColorBy.wage && aggregateIndustryDataMap.loading)
  ) {
    return <LoadingBlock />;
  }

  const filteredClusterRCA = data.filter((d) => {
    const cluster =
      d.clusterId !== null ? clusterMap.data[d.clusterId] : undefined;
    const clusterIdTopParent =
      cluster && cluster.clusterIdTopParent ? cluster.clusterIdTopParent : "";
    if (cluster && !hiddenClusters.includes(clusterIdTopParent.toString())) {
      return d.rca && (d.rca as number) > 0;
    } else {
      return false;
    }
  });

  let max =
    Math.ceil(
      (Math.max(...filteredClusterRCA.map((d) => d.rca as number)) * 1.1) / 10,
    ) * 10;
  let min = Math.min(...filteredClusterRCA.map((d) => d.rca as number));
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

  let colorScale: (val: number) => string | undefined;
  if (
    colorBy === ColorBy.education &&
    aggregateIndustryDataMap.data !== undefined
  ) {
    colorScale = scaleLinear()
      .domain([
        aggregateIndustryDataMap.data.clusterMinMax.minYearsEducation,
        aggregateIndustryDataMap.data.clusterMinMax.medianYearsEducation,
        aggregateIndustryDataMap.data.clusterMinMax.maxYearsEducation,
      ])
      .range(educationColorRange as any) as any;
  } else if (
    colorBy === ColorBy.wage &&
    aggregateIndustryDataMap.data !== undefined
  ) {
    colorScale = scaleLinear()
      .domain([
        aggregateIndustryDataMap.data.clusterMinMax.minHourlyWage,
        aggregateIndustryDataMap.data.clusterMinMax.medianHourlyWage,
        aggregateIndustryDataMap.data.clusterMinMax.maxHourlyWage,
      ])
      .range(wageColorRange as any) as any;
  } else {
    colorScale = scaleLog()
      .domain([min, max])
      .range(intensityColorRange as any)
      .nice() as any;
  }

  const highPresenceScale = scaleLog().domain([1, max]).range([0, 100]).nice();

  const lowPresenceScale = scaleLog().domain([1, min]).range([0, 100]).nice();

  const highPresenceData: BarDatum[] = [];
  const lowPresenceData: BarDatum[] = [];
  filteredClusterRCA.forEach((d) => {
    const cluster =
      d.clusterId !== null ? clusterMap.data[d.clusterId] : undefined;
    const title = cluster && cluster.name !== null ? cluster.name : "";
    let color: string;
    const clusterIndustryDatum =
      d.clusterId !== null
        ? aggregateIndustryDataMap.data.clusters[d.clusterId]
        : undefined;
    if (
      colorBy === ColorBy.education &&
      aggregateIndustryDataMap.data !== undefined
    ) {
      if (clusterIndustryDatum) {
        color = colorScale(clusterIndustryDatum.yearsEducationRank) as string;
      } else {
        color = "gray";
      }
    } else if (
      colorBy === ColorBy.wage &&
      aggregateIndustryDataMap.data !== undefined
    ) {
      if (clusterIndustryDatum) {
        color = colorScale(clusterIndustryDatum.hourlyWageRank) as string;
      } else {
        color = "gray";
      }
    } else {
      const colorDatum = clusterColorMap.find(
        (s) =>
          cluster &&
          cluster.clusterIdTopParent &&
          s.id === cluster.clusterIdTopParent.toString(),
      );
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
      id: d.clusterId !== null ? d.clusterId.toString() : "",
      title,
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
        const cluster = filteredClusterRCA.find(
          (d) => d.clusterId && d.clusterId.toString() === datum.id,
        );
        const rows = [
          [getString("global-ui-year") + ":", defaultYear.toString()],
          [
            getString("global-intensity") + ":",
            cluster && cluster.rca ? cluster.rca.toFixed(3) : "0.000",
          ],
        ];
        if (
          (colorBy === ColorBy.education || colorBy === ColorBy.wage) &&
          aggregateIndustryDataMap.data
        ) {
          const target = aggregateIndustryDataMap.data.clusters[datum.id];
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
          toExpand: getString("cities-top-10-comparison-chart-expand-clusters"),
          toCollapse: getString(
            "cities-top-10-comparison-chart-collapse-clusters",
          ),
        }}
      />
      <RapidTooltipRoot ref={tooltipRef} />
      {highlightErrorPopup}
    </>
  );
};

export default Clusters;
