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
  height: 100%;
`;

const RingsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  animation: ${fadeIn} 0.2s ease-in-out 1 forwards;
`;

interface Props {
  selectedRegionIds: string[];
  minMaxPopulation: [number, number];
  minMaxGdpPppPc: [number, number];
}

const SimpleRings = (props: Props) => {
  const {selectedRegionIds, minMaxPopulation, minMaxGdpPppPc} = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();
  const chartKey = dimensions
    ? cityId + 'industry-space-sized-to-container-key' +
        dimensions.width.toString() + dimensions.height.toString() + city_node_sizing + JSON.stringify(props)
    : cityId + 'industry-space-sized-to-container-key-0-0' + city_node_sizing + JSON.stringify(props);

  const {data} = useProximityData();

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
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
          minMaxPopulation={minMaxPopulation}
          minMaxGdpPppPc={minMaxGdpPppPc}
        />
      </RingsContainer>
    </Root>
  );
};

export default SimpleRings;
