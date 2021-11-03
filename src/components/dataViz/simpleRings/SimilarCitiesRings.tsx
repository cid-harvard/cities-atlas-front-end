import React, {useRef, useEffect, useState} from 'react';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled, {keyframes} from 'styled-components/macro';
import Chart from './Chart';
import useProximityData from '../similarCitiesMap/useProximityData';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import useQueryParams from '../../../hooks/useQueryParams';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;
const Root = styled.div`
  width: 100%;
  height: 450px;
  height: clamp(300px, 70vh, 800px);
`;

const RingsContainer = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.2s ease-in-out 1 forwards;

  div {
    max-width: 100%;

    svg {
      max-width: 100%;
    }
  }
`;

interface Props {
  selectedRegionIds: string[];
  selectedCountryIds: string[];
  minMaxPopulation: [number, number];
  minMaxGdppc: [number, number];
  tooltipNode: HTMLDivElement | null;
}

const SimpleRings = (props: Props) => {
  const {selectedRegionIds, selectedCountryIds, minMaxPopulation, minMaxGdppc, tooltipNode} = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();
  const chartKey = dimensions
    ? cityId + 'industry-space-sized-to-container-key' +
        dimensions.width.toString() + dimensions.height.toString() + city_node_sizing
          + JSON.stringify({selectedRegionIds, selectedCountryIds, minMaxPopulation, minMaxGdppc})
    : cityId + 'industry-space-sized-to-container-key-0-0' + city_node_sizing
      + JSON.stringify({selectedRegionIds, selectedCountryIds, minMaxPopulation, minMaxGdppc});

  const {data} = useProximityData();

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const nodeAtTimeout = rootRef.current;
        if (nodeAtTimeout) {
          const {width, height} = nodeAtTimeout.getBoundingClientRect();
          setDimensions({width, height});
        }
      }, 0);
    }
  }, [rootRef, windowDimensions]);

  return (
    <Root ref={rootRef} key={chartKey}>
      <RingsContainer>
        <Chart
          width={dimensions ? dimensions.width : 0}
          height={dimensions ? dimensions.height : 0}
          data={data}
          selectedRegionIds={selectedRegionIds}
          selectedCountryIds={selectedCountryIds}
          minMaxPopulation={minMaxPopulation}
          minMaxGdppc={minMaxGdppc}
          tooltipNode={tooltipNode}
        />
      </RingsContainer>
    </Root>
  );
};

export default SimpleRings;
