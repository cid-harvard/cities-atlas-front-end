import React, {useCallback, useState} from 'react';
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import {MapState, MapMode} from 'react-city-space-mapbox';
import noop from 'lodash/noop';

type ViewMode = MapMode | 'RING';

const SettingsRow = ({mapContext}: {mapContext: MapState}) => {
  const [view, setView] = useState<ViewMode>(MapMode.GEO);

  const onGeoMapClick = useCallback(() => {
    if (mapContext.intialized && view !== MapMode.GEO) {
      mapContext.setToGeoMap();
      setView(MapMode.GEO);
    }
  }, [mapContext, view]);

  const onUMapClick = useCallback(() => {
    if (mapContext.intialized && view !== MapMode.UMAP) {
      mapContext.setToUMap();
      setView(MapMode.UMAP);
    }
  }, [mapContext, view]);

  const vizNavigation: VizNavItem[] = [
    {
      label: 'Similarity Map',
      active: view === MapMode.GEO,
      onClick: onGeoMapClick,
    }, {
      label: 'Clusters',
      active: view === MapMode.UMAP,
      onClick: onUMapClick,
    }, {
      label: 'Ring',
      active: view === 'RING',
      onClick: noop,
    },
  ];

  return (
    <PreChartRow
      vizNavigation={vizNavigation}
    />
  );
};

export default SettingsRow;