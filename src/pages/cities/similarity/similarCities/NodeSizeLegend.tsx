import { extent } from 'd3-array';
import React from 'react';
import useLayoutData from '../../../../components/dataViz/similarCitiesMap/useLayoutData';
import useQueryParams from '../../../../hooks/useQueryParams';
import { CityNodeSizing, defaultCityNodeSizing } from '../../../../routing/routes';
import { formatNumberLong } from '../../../../Utils';
import styled from 'styled-components';
import { lightBaseColor } from '../../../../styling/styleUtils';

const Root = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 0.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  font-size: 0.85rem;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const ColumnBase = styled.div`
  display: grid;
  grid-template-columns: 2.25rem 1fr;
  grid-column-gap: 0.45rem;
  align-items: center;
`;

const LeftColumn = styled(ColumnBase)`
  grid-column: 1;
`;

const NodeBase = styled.div`
  border-radius: 5000px;
  background-color: ${lightBaseColor};
  border: solid 1px ${lightBaseColor};
  margin: auto;
  flex-shrink: 0;
`;

const NodeSmall = styled(NodeBase)`
  width: 0.5rem;
  height: 0.5rem;
`;
const NodeLarge = styled(NodeBase)`
  width: 1.5rem;
  height: 1.5rem;
`;

const NodeSizeLegend = () => {
  const { city_node_sizing } = useQueryParams();
  const { data } = useLayoutData();

  const nodeSizing = city_node_sizing ? city_node_sizing : defaultCityNodeSizing;
  if (nodeSizing !== CityNodeSizing.uniform) {
    let nodeSizingMinText: string | undefined;
    let nodeSizingMaxText: string | undefined;
    if (data && data.cityGeoJson) {
      if (nodeSizing === CityNodeSizing.population) {
        const [minPop, maxPop] = extent(
          data.cityGeoJson.features.map((f: any) => f.properties.population)) as unknown as [number, number];
        nodeSizingMinText = formatNumberLong(minPop ? minPop : 0);
        nodeSizingMaxText = formatNumberLong(maxPop ? maxPop : 0);
      } else if (nodeSizing === CityNodeSizing.gdpPpp) {
        const [minGdpPpp, maxGdpPpp] = extent(
          data.cityGeoJson.features.map((f: any) => f.properties.gdppc)) as unknown as [number, number];
        nodeSizingMinText = '$' + formatNumberLong(minGdpPpp ? minGdpPpp : 0);
        nodeSizingMaxText = '$' + formatNumberLong(maxGdpPpp ? maxGdpPpp : 0);
      }
    }

    return (
      <Root>
        <LeftColumn style={{ gridRow: 1 }}>
          <NodeLarge /> <div>{nodeSizingMaxText}</div>
        </LeftColumn>
        <LeftColumn style={{ gridRow: 2 }}>
          <NodeSmall /> <div>{nodeSizingMinText}</div>
        </LeftColumn>
      </Root>
    );
  }
  return null;
};

export default NodeSizeLegend;
