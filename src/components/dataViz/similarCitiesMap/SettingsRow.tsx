import React from 'react';
import PreChartRow from '../../../components/general/PreChartRow';
import {Mode} from '../../../components/general/searchIndustryInGraphDropdown';
import {MapState} from 'react-city-space-mapbox';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';

interface Props {
  mapContext: MapState;
}

const SettingsRow = (props: Props) => {
  const {mapContext} = props;
  const {data} = useGlobalLocationData();

  const setHighlighted = (id: string | undefined) => {
    if (mapContext.intialized && data && id !== undefined) {
      const city = data.cities.find(c => c.cityId === id);
      if (city && city.centroidLon && city.centroidLat) {
        mapContext.map.flyTo({
          center: [city.centroidLon, city.centroidLat],
          zoom: 6,
        });
      }
    }
  };

  return (
    <PreChartRow
      searchInGraphOptions={{
        hiddenParents: [],
        setHighlighted,
        digitLevel: null,
        clusterLevel: null,
        mode: Mode.geo,
      }}
    />
  );
};

export default SettingsRow;