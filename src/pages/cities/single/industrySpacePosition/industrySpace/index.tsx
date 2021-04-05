import React, {useState} from 'react';
import UtiltyBar from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import ClusteredIndustrySpace from '../../../../../components/dataViz/industrySpace';
import {ZoomLevel, NodeAction} from '../../../../../components/dataViz/industrySpace/chart/createChart';
import {defaultYear, formatNumberLong} from '../../../../../Utils';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../../styling/styleUtils';
import {
  defaultCompositionType,
  DigitLevel,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import IntensityLegend from '../../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../../components/dataViz/legend/WageLegend';
import NodeLegend from '../../../../../components/dataViz/legend/NodeLegend';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import useSectorMap from '../../../../../hooks/useSectorMap';
import useFluent from '../../../../../hooks/useFluent';
import useQueryParams from '../../../../../hooks/useQueryParams';
import {ClusterMode, defaultClusterMode, ColorBy, defaultNodeSizing, NodeSizing} from '../../../../../routing/routes';
import IndustryDistanceTable from './IndustryDistanceTable';
import {
  useAggregateIndustryMap,
} from '../../../../../hooks/useAggregateIndustriesData';

interface Props {
  cityId: string;
}

const idToKey = (id: string | undefined) => 'industry-space-prechart-row-' + id + new Date();

const IndustrySpacePosition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.Cluster1);
  const [preChartRowKey, setPreChartRowKey] = useState<string>(idToKey(highlighted));
  const sectorMap = useSectorMap();
  const {cluster_overlay, node_sizing, color_by} = useQueryParams();
  const clusterOverlayMode = cluster_overlay ? cluster_overlay : defaultClusterMode;
  const getString = useFluent();
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: DigitLevel.Six, year: defaultYear});

  let legend: React.ReactElement<any> | null;
  if (!(zoomLevel === ZoomLevel.Node
        || clusterOverlayMode === ClusterMode.none
        || clusterOverlayMode === ClusterMode.outline
      ) || color_by === ColorBy.intensity) {
    legend = (
      <IntensityLegend />
    );
  } else if (color_by === ColorBy.education) {
    legend = (
      <EducationLegend />
    );
  } else if (color_by === ColorBy.wage) {
    legend = (
      <WageLegend />
    );
  } else {
    legend = (
      <CategoryLabels
        categories={sectorMap}
        allowToggle={false}
        fullWidth={true}
      />
    );
  }

  const nodeSizing = node_sizing ? node_sizing : defaultNodeSizing;
  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (aggregateIndustryDataMap.data && !aggregateIndustryDataMap.loading) {
    if (nodeSizing === NodeSizing.companies) {
      nodeSizingTitle = 'Node Size by Number of Establishments';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.minSumNumCompany);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.maxSumNumCompany);
    } else if (nodeSizing === NodeSizing.employees) {
      nodeSizingTitle = 'Node Size by Number of Employees';
      nodeSizingMinText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.minSumNumEmploy);
      nodeSizingMaxText = formatNumberLong(aggregateIndustryDataMap.data.globalMinMax.maxSumNumEmploy);
    } else if (nodeSizing === NodeSizing.education) {
      nodeSizingTitle = 'Node Size by Years of Education';
      nodeSizingMinText = parseFloat(
        aggregateIndustryDataMap.data.globalMinMax.minYearsEducation.toFixed(1),
        ) + ' years';
      nodeSizingMaxText = parseFloat(
        aggregateIndustryDataMap.data.globalMinMax.maxYearsEducation.toFixed(1),
        ) + ' years';
    } else if (nodeSizing === NodeSizing.wage) {
      nodeSizingTitle = 'Node Size by Average Hourly Wage';
      nodeSizingMinText = '$' + parseFloat(
        aggregateIndustryDataMap.data.globalMinMax.minHourlyWage.toFixed(2),
        ) + ' (USD)';
      nodeSizingMaxText = '$' + parseFloat(
        aggregateIndustryDataMap.data.globalMinMax.maxHourlyWage.toFixed(2),
        ) + ' (USD)';
    }
  }


  const onNodeSelect = (id: string | undefined, action: NodeAction) => {
    setHighlighted(id);
    if (action === NodeAction.SoftReset || action === NodeAction.Reset) {
      setPreChartRowKey(curr => idToKey(curr + undefined));
    } else if (action !== NodeAction.ExternalSelect) {
      setPreChartRowKey(idToKey(id));
    }
  };

  const onTableSelect = (id: string | undefined) => {
    setHighlighted(id);
    setPreChartRowKey(idToKey(id));
  };

  const sideContent = highlighted === undefined ? (
    <StandardSideTextBlock>
      <ContentTitle>What is my city's position in the Industry Space?</ContentTitle>
      {/* eslint-disable-next-line */}
      <ContentParagraph>{'The Industry Space maps the technological relatedness between all industries. This map is informative, as industries similar to those in which a city is specialized  on are more likely to grow. <City> is <position quality> positioned to access many new industries. The best opportunities are in the <Community>, <Community> and <Community> communities. Some industries likely to emerge and grow in the city include <Ind>, <Ind>, and <Ind>.'}</ContentParagraph>
        <NodeLegend
          sizeBy={nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle ? {
              title: nodeSizingTitle,
              minLabel: nodeSizingMinText,
              maxLabel: nodeSizingMaxText,
            } : null
          }
          colorBy={(zoomLevel === ZoomLevel.Node ||
                    clusterOverlayMode === ClusterMode.none ||
                    clusterOverlayMode === ClusterMode.outline
                  ) && (!color_by || color_by === ColorBy.sector)
                  && !aggregateIndustryDataMap.loading
            ? {
              coloredLabel: getString('global-intensity-high'),
              greyLabel: getString('global-intensity-low'),
            } : null
          }
        />
    </StandardSideTextBlock>
  ) : (
    <StandardSideTextBlock clearStyles={true}>
      <IndustryDistanceTable
        id={highlighted}
        hovered={hovered}
        setHovered={setHovered}
        setHighlighted={onTableSelect}
      />
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
        />
        {legend}
      </ContentGrid>
      <UtiltyBar
      />
    </>
  );
};

export default IndustrySpacePosition;
