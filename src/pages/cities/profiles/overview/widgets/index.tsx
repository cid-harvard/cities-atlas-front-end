import React from 'react';
import styled from 'styled-components';
import { breakPoints } from '../../../../../styling/GlobalGrid';
import TopRow from './topRow';
import BottomRow from './bottomRow';
import useFluent from '../../../../../hooks/useFluent';
import { usePeerGroupCityCount } from '../../../../../components/navigation/secondaryHeader/comparisons/AddComparisonModal';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useCurrentCity from '../../../../../hooks/useCurrentCity';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;

  @media (max-width: 1200px) {
    gap: 0.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  @media ${breakPoints.small} {
    flex-direction: column;
  }
`;

const DisclaimerText = styled.small`
  text-align: center;
  font-size: 0.65rem;
  width: 100%;
  display: block;
`;

const Widgets = () => {
  const getString = useFluent();
  const { city } = useCurrentCity();
  const { data } = usePeerGroupCityCount(city && city.cityId ? city.cityId : null);
  const globalLocations = useGlobalLocationData();

  let cityPeerGroupCountsRegion: string | number = '---';
  let regionName: string = '---';
  if (data && globalLocations.data && city) {
    const region = globalLocations.data.regions.find(d => d.regionId === city.region + '');
    regionName = region && region.regionName ? region.regionName : '';
    cityPeerGroupCountsRegion = data.cityPeerGroupCounts.region;
  }
  return (
    <Root>
      <Row>
        <TopRow />
      </Row>
      <Row>
        <BottomRow />
      </Row>
      <Row>
        <DisclaimerText>
          <div>*{getString('city-overview-ranking-disclaimer', {
              'city-peer-group-counts-region': cityPeerGroupCountsRegion,
              'region-name': regionName,
            })}
          </div>
          <div>**{getString('city-overview-benchmark-disclaimer')}</div>
        </DisclaimerText>
      </Row>
    </Root>
  );
};

export default Widgets;
