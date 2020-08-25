import {extent} from 'd3';

export type Latitude = number;
export type Longitude = number;
export type Coordinate = [Longitude, Latitude];

export const clusterSourceLayerId = 'cluster_source';

export const togglePointer = (mapEl: any, cursor: string) => {
  mapEl.getCanvas().style.cursor = cursor;
};

export const getBounds = (coordinates: Coordinate[]): [Coordinate, Coordinate] => {
  const allLatitudes: Latitude[] = [];
  const allLongitudes: Longitude[] = [];
  coordinates.forEach(([lng, lat]) => {
    allLatitudes.push(lat);
    allLongitudes.push(lng);
  });

  const [minLat, maxLat] = extent(allLatitudes);
  const [minLng, maxLng] = extent(allLongitudes);

  if (minLat === undefined || maxLat === undefined || minLng === undefined || maxLng === undefined) {
    return [[180, -90], [-180, 90]];
  }

  return [[maxLng, minLat], [minLng, maxLat]];
};
