import React, {useEffect} from 'react';
import {useMapContext} from 'react-city-space-mapbox';
import useLayoutData from './useLayoutData';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import {createProximityScale} from './Utils';
import SettingsRow from './SettingsRow';
import useProximityData from './useProximityData';

interface Props {
  showRings: boolean;
  setShowRings: (value: boolean) => void;
}

const MapOptionsAndSettings = (props: Props) => {
  const {showRings, setShowRings} = props;
  const mapContext = useMapContext();

  const {data} = useLayoutData();
  const cityId = useCurrentCityId();

  const {data: proximityData} = useProximityData();

  useEffect(() => {
    if (mapContext.intialized && data && cityId) {
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: number}}) => properties.id.toString() === cityId);
      if (currentCityFeature) {
        mapContext.setNewCenter(currentCityFeature.geometry.coordinates);
        mapContext.setHighlighted(cityId);
      }
    }
  }, [mapContext, data, cityId]);
  useEffect(() => {
    if (mapContext.intialized && proximityData && cityId) {
      const allValues: number[] = [];
      proximityData.cities.forEach(d => d && d.proximity !== null ? allValues.push(d.proximity) : false);
      const colorScale = createProximityScale([0, ...allValues]);
      const proximityColorMap = proximityData.cities.map(({partnerId, proximity}) => ({
        id: partnerId,
        color: colorScale(proximity ? proximity : 0),
      }));
      proximityColorMap.push({id: cityId, color: 'gray'});
      mapContext.setColors(proximityColorMap);
    }
  }, [mapContext, data, proximityData, cityId]);


  return (
    <SettingsRow
      mapContext={mapContext}
      showRings={showRings}
      setShowRings={setShowRings}
    />
  );
};

export default MapOptionsAndSettings;