import React from 'react';
import styled from 'styled-components';
import { usePeerGroupCityCount } from '../../../../../components/navigation/secondaryHeader/comparisons/AddComparisonModal';
import useFluent from '../../../../../hooks/useFluent';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';


const Root = styled.small`
  text-align: center;
  font-size: 0.65rem;
  width: 100%;
  display: block;
`;

interface Props {
  cityId: string;
  regionId: number | null;
}

const DisclaimerText = ({cityId, regionId}: Props) => {
  const getString = useFluent();
  const { data } = usePeerGroupCityCount(cityId);
  const globalLocations = useGlobalLocationData();

  let cityPeerGroupCountsRegion: string | number = '---';
  let regionName: string = '---';
  if (data && globalLocations.data) {
    const region = globalLocations.data.regions.find(d => d.regionId === regionId + '');
    regionName = region && region.regionName ? region.regionName : '';
    cityPeerGroupCountsRegion = data.cityPeerGroupCounts.region + 1;
  }

  return (
    <Root>
      <div>*{getString('city-overview-ranking-disclaimer', {
          'city-peer-group-counts-region': cityPeerGroupCountsRegion,
          'region-name': regionName,
        })}
      </div>
      <div>**{getString('city-overview-benchmark-disclaimer')}</div>
    </Root>
  );
};

export default DisclaimerText;