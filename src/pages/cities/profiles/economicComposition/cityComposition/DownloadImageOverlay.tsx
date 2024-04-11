import React, { useEffect, useState } from "react";
import { useEconomicCompositionQuery } from "../../../../../components/dataViz/treeMap/CompositionTreeMap";
import { useClusterCompositionQuery } from "../../../../../components/dataViz/treeMap/ClusterCompositionTreeMap";
import LoadingBlock from "../../../../../components/transitionStateComponents/VizLoadingBlock";
import { transformData, Inputs } from "react-canvas-treemap";
import { useGlobalIndustryMap } from "../../../../../hooks/useGlobalIndustriesData";
import { useGlobalClusterMap } from "../../../../../hooks/useGlobalClusterData";
import {
  DigitLevel,
  CompositionType,
} from "../../../../../types/graphQL/graphQLTypes";
import {
  sectorColorMap,
  clusterColorMap,
  FullPageOverlay,
  educationColorRange,
  wageColorRange,
} from "../../../../../styling/styleUtils";
import html2canvas from "html2canvas";
import {
  AggregationMode,
  ColorBy,
  ClusterLevel,
} from "../../../../../routing/routes";
import { scaleLinear } from "d3-scale";
import { defaultYear } from "../../../../../Utils";
import { useAggregateIndustryMap } from "../../../../../hooks/useAggregateIndustriesData";

interface Props {
  cityId: number;
  cityName: string | undefined;
  year: number;
  onClose: () => void;
  compositionType: CompositionType;
  aggregationMode: AggregationMode;
  hiddenSectors: string[];
  hiddenClusters: string[];
  digitLevel: DigitLevel;
  clusterLevel: ClusterLevel;
  colorBy: ColorBy;
  treeMapCellsNode: HTMLDivElement;
}

export default (props: Props) => {
  const {
    cityId,
    year,
    onClose,
    compositionType,
    hiddenSectors,
    digitLevel,
    treeMapCellsNode,
    cityName,
    hiddenClusters,
    aggregationMode,
    clusterLevel,
    colorBy,
  } = props;

  const industryResponse = useEconomicCompositionQuery({ cityId, year });
  const clusterResponse = useClusterCompositionQuery({ cityId, year });
  const industryMap = useGlobalIndustryMap();
  const clusterMap = useGlobalClusterMap();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: digitLevel,
    year: defaultYear,
    clusterLevel: parseInt(clusterLevel, 10),
  });
  const [effectRan, setEffectRan] = useState<boolean>(false);

  useEffect(() => {
    if (
      industryResponse.data !== undefined &&
      !industryMap.loading &&
      !industryMap.error &&
      clusterResponse.data !== undefined &&
      !clusterMap.loading &&
      !clusterMap.error &&
      aggregateIndustryDataMap.loading !== true &&
      !aggregateIndustryDataMap.error &&
      aggregateIndustryDataMap.data !== undefined &&
      !effectRan
    ) {
      setEffectRan(true);
      const boundingRect = treeMapCellsNode.getBoundingClientRect();
      const width = boundingRect.width * 2;
      const height = boundingRect.height * 2;
      const treeMapData: Inputs["data"] = [];
      let colorScale: (val: number) => string | undefined;
      let colorMap: { id: string; color: string }[];
      if (aggregationMode === AggregationMode.cluster) {
        const { clusters } = clusterResponse.data;
        colorMap = clusterColorMap;
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
          colorScale = () => undefined;
        }
        clusters.forEach(({ clusterId, numCompany, numEmploy }) => {
          const cluster = clusterMap.data[clusterId];
          if (
            cluster &&
            cluster.level !== null &&
            cluster.level.toString() === clusterLevel
          ) {
            const { name, clusterIdTopParent } = cluster;
            if (
              !hiddenClusters.includes(
                (clusterIdTopParent as number).toString(),
              )
            ) {
              const companies = numCompany ? numCompany : 0;
              const employees = numEmploy ? numEmploy : 0;
              let fill: string | undefined;
              const clusterIndustryDatum =
                aggregateIndustryDataMap.data.clusters[clusterId];
              if (
                colorBy === ColorBy.education &&
                aggregateIndustryDataMap.data !== undefined
              ) {
                if (clusterIndustryDatum) {
                  fill = colorScale(
                    clusterIndustryDatum.yearsEducationRank,
                  ) as string;
                } else {
                  fill = "gray";
                }
              } else if (
                colorBy === ColorBy.wage &&
                aggregateIndustryDataMap.data !== undefined
              ) {
                if (clusterIndustryDatum) {
                  fill = colorScale(
                    clusterIndustryDatum.hourlyWageRank,
                  ) as string;
                } else {
                  fill = "gray";
                }
              } else {
                fill = undefined;
              }
              treeMapData.push({
                id: clusterId,
                value:
                  compositionType === CompositionType.Companies
                    ? companies
                    : employees,
                title: name ? name : "",
                fill,
                topLevelParentId: (clusterIdTopParent as number).toString(),
              });
            }
          }
        });
      } else {
        const { industries } = industryResponse.data;
        colorMap = sectorColorMap;
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
          colorScale = () => undefined;
        }
        industries.forEach(({ naicsId, numCompany, numEmploy }) => {
          const industry = industryMap.data[naicsId];
          if (industry && industry.level === digitLevel) {
            const { name, naicsIdTopParent } = industry;
            if (!hiddenSectors.includes(naicsIdTopParent.toString())) {
              const companies = numCompany ? numCompany : 0;
              const employees = numEmploy ? numEmploy : 0;
              let fill: string | undefined;
              if (
                (colorBy === ColorBy.education || colorBy === ColorBy.wage) &&
                aggregateIndustryDataMap.data
              ) {
                const target =
                  aggregateIndustryDataMap.data.industries[naicsId];
                const targetValue =
                  colorBy === ColorBy.education
                    ? target.yearsEducationRank
                    : target.hourlyWageRank;
                fill = colorScale(targetValue);
              }
              treeMapData.push({
                id: naicsId,
                value:
                  compositionType === CompositionType.Companies
                    ? companies
                    : employees,
                title: name ? name : "",
                fill,
                topLevelParentId: naicsIdTopParent.toString(),
              });
            }
          }
        });
      }
      const transformed = transformData({
        data: treeMapData,
        width,
        height,
        colorMap,
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (context) {
        transformed.treeMapCells.forEach((cell) => {
          context.beginPath();
          context.rect(cell.x0, cell.y0, cell.x1, cell.y1);
          context.fillStyle = cell.color;
          context.fill();
          context.strokeStyle = "#fff";
          context.stroke();
        });
        html2canvas(treeMapCellsNode, {
          allowTaint: true,
          backgroundColor: "rgba(0,0,0,0)",
        })
          .then((cellLabels) => {
            context.drawImage(cellLabels, 0, 0, width, height);
            const link = document.createElement("a");
            link.download = cityName
              ? `${cityName} - Economic Composition of Number of ${compositionType} in ${year}.png`
              : "treemap-visualization.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            link.remove();
            onClose();
          })
          .catch((e) => {
            console.error(e);
            onClose();
          });
      } else {
        console.error("Failed to get context for " + canvas);
        onClose();
      }
    }
  }, [
    aggregateIndustryDataMap,
    aggregationMode,
    industryResponse,
    clusterResponse,
    industryMap,
    clusterMap,
    onClose,
    compositionType,
    digitLevel,
    clusterLevel,
    hiddenSectors,
    hiddenClusters,
    treeMapCellsNode,
    cityName,
    year,
    colorBy,
    effectRan,
  ]);

  if (industryResponse.error) {
    console.error(industryResponse.error);
    onClose();
  }

  if (clusterResponse.error) {
    console.error(clusterResponse.error);
    onClose();
  }

  return (
    <FullPageOverlay>
      <LoadingBlock />
    </FullPageOverlay>
  );
};
