import React, {useCallback, useState} from 'react';
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import {Mode} from '../../../components/general/searchIndustryInGraphDropdown';
import {MapState, MapMode} from 'react-city-space-mapbox';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';

interface Props {
  mapContext: MapState;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
}

const SettingsRow = (props: Props) => {
  const {mapContext, showRings, setShowRings} = props;
  const [view, setView] = useState<MapMode>(MapMode.GEO);
  const {data} = useGlobalLocationData();

  const onGeoMapClick = useCallback(() => {
    if (mapContext.intialized && view !== MapMode.GEO) {
      mapContext.setToGeoMap();
    }
    setView(MapMode.GEO);
    setShowRings(false);
  }, [mapContext, view, setShowRings]);

  // const onUMapClick = useCallback(() => {
  //   if (mapContext.intialized && view !== MapMode.UMAP) {
  //     mapContext.setToUMap();
  //   }
  //   setView(MapMode.UMAP);
  //   setShowRings(false);
  // }, [mapContext, view, setShowRings]);

  const onShowRingsClick = useCallback(() => {
    setShowRings(true);
  }, [setShowRings]);

  const vizNavigation: VizNavItem[] = [
    {
      label: 'Similarity Map',
      active: view === MapMode.GEO && !showRings,
      onClick: onGeoMapClick,
    }, {
    //   label: 'Clusters',
    //   active: view === MapMode.UMAP && !showRings,
    //   onClick: onUMapClick,
    // }, {
      label: 'Ring',
      active: showRings,
      onClick: onShowRingsClick,
    },
  ];

  const setHighlighted = (id: string | undefined) => {
    if (mapContext.intialized && view === MapMode.GEO && data && id !== undefined) {
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
      vizNavigation={vizNavigation}
      settingsOptions={{
        cityColorBy: true,
        cityNodeSizing: true,
      }}
      searchInGraphOptions={{
        hiddenParents: [],
        setHighlighted,
        digitLevel: null,
        clusterLevel: null,
        mode: Mode.geo,
        hidden: showRings,
      }}
    />
  );
};

export default SettingsRow;