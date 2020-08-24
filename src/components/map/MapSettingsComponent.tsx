import React, {useState} from 'react';
import {clusterSourceLayerId, togglePointer} from './Utils';

export interface Settings {
  allowZoom?: boolean;
  allowPan?: boolean;
  mapCallback?: (map: any) => void;
}

interface Props extends Settings{
  map: any;
}


const MapSettingsComponent = (props: Props) => {
  const {
    map, mapCallback,
  } = props;

  const [haveSettingsBeenSet, setSettings] = useState<boolean>(false);

  if (map && haveSettingsBeenSet === false) {

    const clusterClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['cluster_count'],
      });
      const clusterId = features[0].properties.cluster_id;
      if (clusterId !== undefined) {
        map.getSource(clusterSourceLayerId).getClusterExpansionZoom(
          clusterId,
          function(err: any, zoom: any) {
            if (err) {
              return;
            }
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom,
            });
          },
        );
      }
    };

    const clusterTextClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clustered_text'],
      });
      const clusterId = features[0].properties.cluster_id;
      if (clusterId !== undefined) {
        map.getSource(clusterSourceLayerId).getClusterExpansionZoom(
          clusterId,
          function(err: any, zoom: any) {
            if (err) {
              return;
            }
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom,
            });
          },
        );
      }
    };


    const unclusteredPointClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['unclustered_point'],
      });
      const id = features[0].properties.id;
      if (id !== undefined) {
        const sourceData = map.getSource(clusterSourceLayerId);
        const match = sourceData._data.features.find(({properties}: {properties: {id: string}}) => properties.id === id);
        if (match) {
          const animationDuration = 600;
          map.easeTo({
            center: match.geometry.coordinates,
            zoom: 7,
            duration: animationDuration,
          });
        }
      }
    };

    const setCursor = () => togglePointer(map, 'pointer');
    const resetCursor = () => togglePointer(map, '');

    map.on('click', 'cluster_count', clusterClick);
    map.on('click', 'clustered_text', clusterTextClick);
    map.on('click', 'unclustered_point', unclusteredPointClick);
    map.on('mouseenter', 'cluster_count', setCursor);
    map.on('mouseleave', 'cluster_count', resetCursor);

    if (mapCallback !== undefined) {
      mapCallback(map);
    }
    setSettings(true);
  }

  return <React.Fragment />;
};

export default MapSettingsComponent;
