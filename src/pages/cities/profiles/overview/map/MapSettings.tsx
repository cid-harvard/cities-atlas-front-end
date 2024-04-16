import React, { useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface Props {
  map: any;
}

const MapSettings = ({ map }: Props) => {
  useEffect(() => {
    if (map) {
      map.addControl(new mapboxgl.NavigationControl());
      map.scrollZoom.disable();
    }
  }, [map]);
  return <></>;
};

export default MapSettings;
