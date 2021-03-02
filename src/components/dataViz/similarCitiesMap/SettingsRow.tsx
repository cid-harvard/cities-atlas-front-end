import React, {useCallback, useState} from 'react';
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import {MapState, MapMode} from 'react-city-space-mapbox';

interface Props {
  mapContext: MapState;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
}


const SettingsRow = (props: Props) => {
  const {mapContext, showRings, setShowRings} = props;
  const [view, setView] = useState<MapMode>(MapMode.GEO);

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

  return (
    <PreChartRow
      vizNavigation={vizNavigation}
      settingsOptions={{
        cityColorBy: true,
        cityNodeSizing: true,
      }}
    />
  );
};

export default SettingsRow;