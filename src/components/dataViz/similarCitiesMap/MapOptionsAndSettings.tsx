import React, {useCallback, useEffect} from 'react';
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import {useMapContext} from 'react-city-space-mapbox';
import useLayoutData from './useLayoutData';
import useCurrentCityId from '../../../hooks/useCurrentCityId';

const MapOptionsAndSettings = () => {
  const mapContext = useMapContext();
  const {data} = useLayoutData();
  const cityId = useCurrentCityId();

  useEffect(() => {
    if (mapContext.intialized && data && cityId) {
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: number}}) => properties.id.toString() === cityId);
      if (currentCityFeature) {
        mapContext.setNewCenter(currentCityFeature.geometry.coordinates);
        mapContext.setHighlighted(cityId);
      }
    }
  }, [mapContext, data, cityId])

  const onGeoMapClick = useCallback(() => {
    if (mapContext.intialized) {
      mapContext.setToGeoMap();
    }
  }, [mapContext])

  const onUMapClick = useCallback(() => {
    if (mapContext.intialized) {
      mapContext.setToUMap();
    }
  }, [mapContext])

  const vizNavigation: VizNavItem[] = [
    {
      label: 'Similarity Map',
      active: false,
      onClick: onGeoMapClick,
    }, {
      label: 'Clusters',
      active: false,
      onClick: onUMapClick,
    }, {
      label: 'Ring',
      active: false,
      onClick: () => console.log('Ring'),
    },
  ];

  return (
    <PreChartRow
      vizNavigation={vizNavigation}
    />
  );
}

export default MapOptionsAndSettings;