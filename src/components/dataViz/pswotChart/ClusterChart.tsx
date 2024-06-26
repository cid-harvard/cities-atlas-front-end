import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ClassificationNaicsCluster,
  ClusterLevel,
  DigitLevel,
  CompositionType,
  defaultCompositionType,
} from "../../../types/graphQL/graphQLTypes";
import { useGlobalClusterMap } from "../../../hooks/useGlobalClusterData";
import { useAggregateIndustryMap } from "../../../hooks/useAggregateIndustriesData";
import { usePrevious } from "react-use";
import { useWindowWidth } from "../../../contextProviders/appContext";
import { breakPoints } from "../../../styling/GlobalGrid";
import ErrorBoundary from "../ErrorBoundary";
import styled from "styled-components/macro";
import {
  clusterColorMap,
  educationColorRange,
  wageColorRange,
  primaryColorDark,
} from "../../../styling/styleUtils";
import SimpleError from "../../transitionStateComponents/SimpleError";
import LoadingBlock, {
  LoadingOverlay,
} from "../../transitionStateComponents/VizLoadingBlock";
import PSwotPlot, { Datum } from "react-pswot-plot";
import useClusterRCAData, {
  SuccessResponse,
} from "../../../hooks/useClusterRCAData";
import useFluent from "../../../hooks/useFluent";
import { NodeSizing, ColorBy } from "../../../routing/routes";
import {
  getStandardTooltip,
  RapidTooltipRoot,
} from "../../../utilities/rapidTooltip";
import { rgba } from "polished";
import { defaultYear } from "../../../Utils";
import { scaleLinear } from "d3-scale";
import orderBy from "lodash/orderBy";
import QuickError from "../../transitionStateComponents/QuickError";
import BenchmarkAxisLegend from "./BenchmarkAxisLegend";

const benchmarkLegendBuffer = 35;

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const SizingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const VizContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  .cluster-bar-chart-y-axis-label {
    text-transform: uppercase;
    font-size: 0.75rem;
  }
`;

interface Props {
  highlighted: string | null;
  setHighlighted: (value: string | undefined) => void;
  clusterLevel: ClusterLevel;
  nodeSizing: NodeSizing;
  hiddenClusters: ClassificationNaicsCluster["id"][];
  colorBy: ColorBy;
  compositionType: CompositionType;
}

const PSWOTChart = (props: Props) => {
  const {
    hiddenClusters,
    setHighlighted,
    clusterLevel,
    highlighted,
    colorBy,
    compositionType,
    nodeSizing,
  } = props;

  const { loading, error, data } = useClusterRCAData(clusterLevel);
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Sector,
    year: defaultYear,
    clusterLevel,
  });
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<
    { width: number; height: number } | undefined
  >(undefined);
  const getString = useFluent();

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const { width, height } = node.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [rootRef, windowDimensions]);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const clusters = useGlobalClusterMap();

  const highlightCluster = highlighted ? clusters.data[highlighted] : undefined;

  const setHovered = (
    datum: {
      label: string;
      fill?: string;
      id?: string;
      x?: number;
      y?: number;
    },
    coords: { x: number; y: number },
  ) => {
    const node = tooltipRef.current;
    const cluster =
      clusters && clusters.data && datum.id
        ? clusters.data[datum.id]
        : undefined;
    if (node) {
      const rows: string[][] = [];
      let simple = false;
      if (datum.x !== undefined) {
        rows.push([
          "Relative Presence",
          parseFloat(datum.x.toFixed(3)).toString(),
        ]);
      }
      if (datum.y) {
        rows.push([
          "Technological Fit",
          parseFloat(datum.y.toFixed(3)).toString(),
        ]);
      }
      if (
        datum.id &&
        (!cluster ||
          cluster.clusterId === null ||
          cluster.clusterId === undefined)
      ) {
        if (!datum.id.includes("axis")) {
          rows.push([
            getString(
              "pswot-cluster-quadrant-tooltips-" + datum.id.toLowerCase(),
            ),
          ]);
        } else {
          simple = true;
        }
      } else if (cluster && cluster.clusterId) {
        if (
          (colorBy === ColorBy.education || colorBy === ColorBy.wage) &&
          aggregateIndustryDataMap.data
        ) {
          const target =
            aggregateIndustryDataMap.data.clusters[cluster.clusterId];
          const targetValue =
            colorBy === ColorBy.education
              ? target.yearsEducation
              : target.hourlyWage;
          rows.push([
            getString("global-formatted-color-by", { type: colorBy }),
            (colorBy === ColorBy.wage ? "$" : "") + targetValue.toFixed(2),
          ]);
        }
      }
      const title = simple
        ? `
        <span style="font-weight:400;">${getString(datum.id + "-about")}</span>
      `
        : datum.label;
      node.innerHTML = getStandardTooltip({
        title,
        color: datum.fill ? rgba(datum.fill, 0.5) : "#f69c7c",
        rows,
        boldColumns: [1],
        simple,
      });
      node.style.top = coords.y + "px";
      node.style.left = coords.x + "px";
      node.style.display = "block";
    }
  };

  const removeHovered = useCallback(() => {
    const node = tooltipRef.current;
    if (node) {
      node.style.display = "none";
    }
  }, [tooltipRef]);

  useEffect(() => {
    removeHovered();
  }, [data, removeHovered]);

  const prevData = usePrevious(data);
  let dataToUse: SuccessResponse | undefined;
  if (data) {
    dataToUse = data;
  } else if (prevData) {
    dataToUse = prevData;
  } else {
    dataToUse = undefined;
  }

  let output: React.ReactElement<any> | null;
  if (
    clusters.loading ||
    aggregateIndustryDataMap.loading ||
    !dimensions ||
    (loading && prevData === undefined)
  ) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (clusters.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (aggregateIndustryDataMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (
    dataToUse !== undefined &&
    aggregateIndustryDataMap &&
    aggregateIndustryDataMap.data &&
    clusters &&
    clusters.data
  ) {
    const { clusterRca, clusterDensity, clusterData } = dataToUse;

    const pswotChartData: Datum[] = [];
    const { clusterMinMax } = aggregateIndustryDataMap.data;

    let radiusScale: (value: number) => number | undefined;
    if (
      nodeSizing === NodeSizing.cityCompanies ||
      nodeSizing === NodeSizing.cityEmployees
    ) {
      const field =
        nodeSizing === NodeSizing.cityEmployees ? "numEmploy" : "numCompany";
      const allValues = clusterData
        .filter((c) => c.level === clusterLevel)
        .map((c) => (c[field] ? c[field] : 0)) as number[];
      radiusScale = scaleLinear()
        .domain([0, Math.max(...allValues)] as [number, number])
        .range([4, 16]);
    } else if (nodeSizing === NodeSizing.globalCompanies) {
      const minSizeBy =
        clusterMinMax && clusterMinMax.minSumNumCompany
          ? clusterMinMax.minSumNumCompany
          : 0;
      const maxSizeBy =
        clusterMinMax && clusterMinMax.maxSumNumCompany
          ? clusterMinMax.maxSumNumCompany
          : 1;
      radiusScale = scaleLinear().domain([minSizeBy, maxSizeBy]).range([4, 16]);
    } else if (nodeSizing === NodeSizing.globalEmployees) {
      const minSizeBy =
        clusterMinMax && clusterMinMax.minSumNumEmploy
          ? clusterMinMax.minSumNumEmploy
          : 0;
      const maxSizeBy =
        clusterMinMax && clusterMinMax.maxSumNumEmploy
          ? clusterMinMax.maxSumNumEmploy
          : 1;
      radiusScale = scaleLinear().domain([minSizeBy, maxSizeBy]).range([4, 16]);
    } else {
      radiusScale = (_unused: number) => 5.5;
    }

    let colorScale: (value: number) => string | undefined;
    if (colorBy === ColorBy.education) {
      const { minYearsEducation, medianYearsEducation, maxYearsEducation } =
        clusterMinMax;
      colorScale = scaleLinear()
        .domain([minYearsEducation, medianYearsEducation, maxYearsEducation])
        .range(educationColorRange as any) as any;
    } else if (colorBy === ColorBy.wage) {
      const { minHourlyWage, medianHourlyWage, maxHourlyWage } = clusterMinMax;
      colorScale = scaleLinear()
        .domain([minHourlyWage, medianHourlyWage, maxHourlyWage])
        .range(wageColorRange as any) as any;
    } else {
      colorScale = () => undefined;
    }

    const highlightError = Boolean(
      highlighted &&
        (!clusterRca.find(
          (d) =>
            d.clusterId !== null &&
            d.clusterId.toString() === highlighted.toString(),
        ) ||
          (clusters.data[highlighted] && !clusters.data[highlighted].tradable)),
    );

    clusterRca.forEach((n) => {
      const cluster = n.clusterId ? clusters.data[n.clusterId] : undefined;
      const clusterGlobalData = n.clusterId
        ? aggregateIndustryDataMap.data.clusters[n.clusterId]
        : undefined;
      const clusterId = cluster ? cluster.clusterId : "";
      const tradable = cluster && cluster.tradable ? true : false;
      const clusterColor = clusterColorMap.find(
        (c) =>
          cluster &&
          cluster.clusterIdTopParent &&
          c.id === cluster.clusterIdTopParent.toString(),
      );
      const datum = clusterDensity.find(
        (nn) =>
          n.clusterId !== null &&
          nn.clusterId.toString() === n.clusterId.toString(),
      );
      if (
        clusterColor &&
        datum &&
        !hiddenClusters.includes(clusterColor.id) &&
        tradable &&
        n.comparableIndustry
      ) {
        const x = n.rca !== null ? n.rca : 0;
        let densityKey: "densityCompany" | "densityEmploy";
        if (
          compositionType === CompositionType.Companies ||
          (!compositionType &&
            defaultCompositionType === CompositionType.Companies)
        ) {
          densityKey = "densityCompany";
        } else {
          densityKey = "densityEmploy";
        }
        const y =
          datum[densityKey] !== null ? (datum[densityKey] as number) : 0;

        let radius: number;
        if (
          nodeSizing === NodeSizing.cityCompanies ||
          nodeSizing === NodeSizing.cityEmployees
        ) {
          const field =
            nodeSizing === NodeSizing.cityEmployees
              ? "numEmploy"
              : "numCompany";
          const naicsDatum = clusterData.find(
            (nn) => nn.clusterId === clusterId,
          );
          radius = radiusScale(
            naicsDatum && naicsDatum[field] !== null
              ? (naicsDatum[field] as number)
              : 0,
          ) as number;
        } else if (nodeSizing === NodeSizing.globalCompanies) {
          radius = radiusScale(
            clusterGlobalData && clusterGlobalData.sumNumCompany
              ? clusterGlobalData.sumNumCompany
              : 0,
          ) as number;
        } else if (nodeSizing === NodeSizing.globalEmployees) {
          radius = radiusScale(
            clusterGlobalData && clusterGlobalData.sumNumEmploy
              ? clusterGlobalData.sumNumEmploy
              : 0,
          ) as number;
        } else {
          radius = 5.5;
        }

        let fill: string | undefined;
        if (colorBy === ColorBy.education) {
          fill = colorScale(
            clusterGlobalData ? clusterGlobalData.yearsEducationRank : 0,
          );
        } else if (colorBy === ColorBy.wage) {
          fill = colorScale(
            clusterGlobalData ? clusterGlobalData.hourlyWageRank : 0,
          );
        } else {
          fill = clusterColor ? rgba(clusterColor.color, 0.7) : undefined;
        }
        pswotChartData.push({
          id: clusterId,
          label: cluster && cluster.name ? cluster.name : clusterId,
          x,
          y,
          radius,
          fill,
          highlighted:
            highlightCluster && highlightCluster.clusterId === clusterId,
          faded:
            !highlightError &&
            highlightCluster &&
            highlightCluster.clusterId !== clusterId,
          onMouseMove: setHovered,
          onMouseLeave: removeHovered,
        });
      }
    });

    const sortedData = orderBy(pswotChartData, ["radius"], ["desc"]);

    const loadingOverlay = loading ? <LoadingBlock /> : null;

    const highlightErrorPopup = highlightError ? (
      <QuickError closeError={() => setHighlighted(undefined)}>
        {getString("global-ui-error-industry-not-in-data-set")}
      </QuickError>
    ) : null;

    output = (
      <VizContainer
        style={{ height: dimensions.height - benchmarkLegendBuffer }}
      >
        <ErrorBoundary>
          <PSwotPlot
            id={"react-pswot-plot-demo"}
            data={sortedData}
            chartTitle={"SWOT Scatterplot also showing Possible Entrants"}
            averageLineText={getString("pswot-average-line-text")}
            quadrantLabels={{
              I: getString("pswot-quadrant-labels-i"),
              II: getString("pswot-quadrant-labels-ii"),
              III: getString("pswot-quadrant-labels-iii"),
              IV: getString("pswot-quadrant-labels-iv"),
              V: "Possible\nEntrants",
            }}
            quadrantBackgroundColors={{
              I: "#dadbdd",
              II: "#e6e7e8",
              III: "#f2f3f3",
              IV: "#fafafb",
              V: "#edf6f4",
            }}
            zeroAxisLabel={getString("pswot-zero-axis-label")}
            yLineText={getString("pswot-y-average-line-text")}
            axisLabels={{
              left: getString("pswot-axis-labels-left"),
              leftUp:
                dimensions.height > 400
                  ? getString("pswot-axis-labels-left-up")
                  : "",
              leftDown:
                dimensions.height > 400
                  ? getString("pswot-axis-labels-left-down")
                  : "",
              bottom: "-",
            }}
            axisLabelColor={"#333"}
            quadrantLabelColor={primaryColorDark}
            onQuadrantLabelMouseMove={setHovered}
            onQuadrantLabelMouseLeave={removeHovered}
          />
        </ErrorBoundary>
        <BenchmarkAxisLegend />
        {loadingOverlay}
        {highlightErrorPopup}
      </VizContainer>
    );
  } else {
    output = null;
  }
  return (
    <>
      <Root>
        <SizingContainer ref={rootRef}>{output}</SizingContainer>
      </Root>
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default PSWOTChart;
