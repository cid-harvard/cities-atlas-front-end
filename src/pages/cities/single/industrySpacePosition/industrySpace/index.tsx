import React, {useState} from 'react';
import UtiltyBar from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import ClusteredIndustrySpace from '../../../../../components/dataViz/industrySpace';
import {ZoomLevel, NodeAction} from '../../../../../components/dataViz/industrySpace/chart/createChart';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../../styling/styleUtils';
import {
  defaultCompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import IntensityLegend from '../../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../../components/dataViz/legend/WageLegend';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import useSectorMap from '../../../../../hooks/useSectorMap';
import useQueryParams from '../../../../../hooks/useQueryParams';
import {Toggle, ColorBy} from '../../../../../routing/routes';
import IndustryDistanceTable from './IndustryDistanceTable';
import styled from 'styled-components/macro';
import NodeLegendSrc from './node-legend.svg';

const NodeLegend = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem;
  position: absolute;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
  border-top: none;

  img {
    width: 100%;
    max-width: 200px;
    max-height: 100%;
  }

  @media (max-height: 875px) {
    position: sticky;
  }
`;

interface Props {
  cityId: string;
}

const idToKey = (id: string | undefined) => 'industry-space-prechart-row-' + id + new Date();

const IndustrySpacePosition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.Cluster);
  const [preChartRowKey, setPreChartRowKey] = useState<string>(idToKey(highlighted));
  const sectorMap = useSectorMap();
  const {cluster_overlay, node_sizing, color_by} = useQueryParams();
  const hideClusterOverlay= cluster_overlay === Toggle.Off;

  let legend: React.ReactElement<any> | null;
  if (!(zoomLevel === ZoomLevel.Node || hideClusterOverlay) || color_by === ColorBy.intensity) {
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


  const nodeLegend = zoomLevel === ZoomLevel.Node || hideClusterOverlay ? (
    <NodeLegend>
      <img
        src={NodeLegendSrc}
        alt={'Colored Nodes mean High Intensity Employment, Gray Nodes mean Low Intensity Employment'}
      />
    </NodeLegend>
  ) : null;


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
      <ContentParagraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ContentParagraph>
        {nodeLegend}
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
          setZoomLevel={setZoomLevel}
          hideClusterOverlay={hideClusterOverlay}
          setHovered={setHovered}
          hovered={hovered}
          nodeSizing={node_sizing}
          onNodeSelect={onNodeSelect}
          preChartRowKey={preChartRowKey}
        />
        {legend}
      </ContentGrid>
      <UtiltyBar
      />
    </>
  );
};

export default IndustrySpacePosition;
