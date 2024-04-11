import React, { useState } from "react";
import UtilityBar from "../../../../../components/navigation/secondaryHeader/UtilityBar";
import ClusteredIndustrySpace from "../../../../../components/dataViz/industrySpace";
import {
  ZoomLevel,
  NodeAction,
} from "../../../../../components/dataViz/industrySpace/chart/createChart";
import { defaultYear, formatNumberLong } from "../../../../../Utils";
import { ContentGrid } from "../../../../../styling/styleUtils";
import {
  defaultCompositionType,
  DigitLevel,
} from "../../../../../types/graphQL/graphQLTypes";
import CategoryLabels from "../../../../../components/dataViz/legend/CategoryLabels";
import IntensityLegend from "../../../../../components/dataViz/legend/IntensityLegend";
import EducationLegend from "../../../../../components/dataViz/legend/EducationLegend";
import WageLegend from "../../../../../components/dataViz/legend/WageLegend";
import NodeLegend from "../../../../../components/dataViz/legend/NodeLegend";
import StandardSideTextBlock from "../../../../../components/general/StandardSideTextBlock";
import useSectorMap from "../../../../../hooks/useSectorMap";
import useFluent from "../../../../../hooks/useFluent";
import useQueryParams from "../../../../../hooks/useQueryParams";
import {
  ClusterMode,
  defaultClusterMode,
  ColorBy,
  NodeSizing,
} from "../../../../../routing/routes";
import IndustryDistanceTable from "./IndustryDistanceTable";
import { useAggregateIndustryMap } from "../../../../../hooks/useAggregateIndustriesData";
import useRCAData from "../../../../../components/dataViz/industrySpace/chart/useRCAData";
import { extent } from "d3-array";
import SideText from "./SideText";

interface Props {
  cityId: string;
}

const idToKey = (id: string | undefined) =>
  "industry-space-prechart-row-" + id + new Date();

const IndustrySpacePosition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.Cluster1);
  const [preChartRowKey, setPreChartRowKey] = useState<string>(
    idToKey(highlighted),
  );
  const sectorMap = useSectorMap();
  const { cluster_overlay, node_sizing, color_by, rca_threshold } =
    useQueryParams();
  const clusterOverlayMode = cluster_overlay
    ? cluster_overlay
    : defaultClusterMode;
  const rcaThreshold =
    rca_threshold !== undefined ? parseFloat(rca_threshold) : 1;
  const getString = useFluent();
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Six,
    year: defaultYear,
  });
  const { data: rcaData } = useRCAData(DigitLevel.Six);

  let legend: React.ReactElement<any> | null;
  if (
    !(
      zoomLevel === ZoomLevel.Node ||
      clusterOverlayMode === ClusterMode.none ||
      clusterOverlayMode === ClusterMode.outline
    )
  ) {
    legend = <IntensityLegend />;
  } else if (color_by === ColorBy.education) {
    legend = <EducationLegend />;
  } else if (color_by === ColorBy.wage) {
    legend = <WageLegend />;
  } else {
    legend = (
      <CategoryLabels
        categories={sectorMap}
        allowToggle={false}
        fullWidth={true}
      />
    );
  }

  const nodeSizing = node_sizing ? node_sizing : NodeSizing.rca;
  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (aggregateIndustryDataMap.data && !aggregateIndustryDataMap.loading) {
    if (nodeSizing === NodeSizing.globalCompanies) {
      nodeSizingTitle = "Node Size by Global Number of Establishments";
      nodeSizingMinText = formatNumberLong(
        aggregateIndustryDataMap.data.globalMinMax.minSumNumCompany,
      );
      nodeSizingMaxText = formatNumberLong(
        aggregateIndustryDataMap.data.globalMinMax.maxSumNumCompany,
      );
    } else if (nodeSizing === NodeSizing.globalEmployees) {
      nodeSizingTitle = "Node Size by Global Number of Employees";
      nodeSizingMinText = formatNumberLong(
        aggregateIndustryDataMap.data.globalMinMax.minSumNumEmploy,
      );
      nodeSizingMaxText = formatNumberLong(
        aggregateIndustryDataMap.data.globalMinMax.maxSumNumEmploy,
      );
    }
    if (nodeSizing === NodeSizing.cityCompanies && rcaData) {
      nodeSizingTitle = "Node Size by Number of Establishments in City";
      const [min, max] = extent(
        rcaData.naicsData
          .map((d) => d.numCompany)
          .filter((d) => d !== null) as number[],
      );
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.cityEmployees && rcaData) {
      nodeSizingTitle = "Node Size by Number of Employees in City";
      const [min, max] = extent(
        rcaData.naicsData
          .map((d) => d.numEmploy)
          .filter((d) => d !== null) as number[],
      );
      nodeSizingMinText = formatNumberLong(min ? min : 0);
      nodeSizingMaxText = formatNumberLong(max ? max : 0);
    } else if (nodeSizing === NodeSizing.rca && rcaData) {
      nodeSizingTitle = "Node Size by Relative Presence";
      const [min, max] = extent(
        rcaData.naicsRca
          .map((d) => d.rca)
          .filter((d) => d !== null) as number[],
      );
      nodeSizingMinText = Math.floor(min ? min : 0) + "x expected presence";
      nodeSizingMaxText = Math.ceil(max ? max : 0) + "x expected presence";
    }
  }

  const onNodeSelect = (id: string | undefined, action: NodeAction) => {
    setHighlighted(id);
    if (action === NodeAction.SoftReset || action === NodeAction.Reset) {
      setPreChartRowKey((curr) => idToKey(curr + undefined));
    } else if (action !== NodeAction.ExternalSelect) {
      setPreChartRowKey(idToKey(id));
    }
  };

  const onTableSelect = (id: string | undefined) => {
    setHighlighted(id);
    setPreChartRowKey(idToKey(id));
  };

  const sideContent =
    highlighted === undefined ? (
      <SideText>
        <NodeLegend
          sizeBy={
            nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle
              ? {
                  title: nodeSizingTitle,
                  minLabel: nodeSizingMinText,
                  maxLabel: nodeSizingMaxText,
                }
              : null
          }
          colorBy={
            (zoomLevel === ZoomLevel.Node ||
              clusterOverlayMode === ClusterMode.none ||
              clusterOverlayMode === ClusterMode.outline) &&
            (!color_by || color_by === ColorBy.sector) &&
            !aggregateIndustryDataMap.loading
              ? {
                  coloredLabel: getString("global-intensity-high"),
                  greyLabel: getString("global-intensity-low"),
                }
              : null
          }
        />
      </SideText>
    ) : (
      <StandardSideTextBlock clearStyles={true}>
        <IndustryDistanceTable
          id={highlighted}
          hovered={hovered}
          setHovered={setHovered}
          setHighlighted={onTableSelect}
        >
          <NodeLegend
            sizeBy={
              nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle
                ? {
                    title: nodeSizingTitle,
                    minLabel: nodeSizingMinText,
                    maxLabel: nodeSizingMaxText,
                  }
                : null
            }
            colorBy={
              (zoomLevel === ZoomLevel.Node ||
                clusterOverlayMode === ClusterMode.none ||
                clusterOverlayMode === ClusterMode.outline) &&
              (!color_by || color_by === ColorBy.sector) &&
              !aggregateIndustryDataMap.loading
                ? {
                    coloredLabel: getString("global-intensity-high"),
                    greyLabel: getString("global-intensity-low"),
                  }
                : null
            }
          />
        </IndustryDistanceTable>
      </StandardSideTextBlock>
    );

  return (
    <>
      <ContentGrid>
        {sideContent}
        <ClusteredIndustrySpace
          cityId={parseInt(cityId, 10)}
          year={defaultYear}
          compositionType={defaultCompositionType}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          clusterOverlayMode={clusterOverlayMode}
          setHovered={setHovered}
          hovered={hovered}
          nodeSizing={node_sizing}
          onNodeSelect={onNodeSelect}
          preChartRowKey={preChartRowKey}
          colorBy={color_by ? color_by : ColorBy.sector}
          rcaThreshold={isNaN(rcaThreshold) ? 1 : rcaThreshold}
        />
        {legend}
      </ContentGrid>
      <UtilityBar />
    </>
  );
};

export default IndustrySpacePosition;
