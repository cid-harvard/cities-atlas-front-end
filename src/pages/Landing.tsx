import React, {useState, useEffect} from 'react';
import ClusterMap from '../components/map/ClusterLandingMap';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import {CitiesGeoJsonData, Coordinate} from '../data/citiesTypes';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import { Layer, Feature, GeoJSONLayer } from 'react-mapbox-gl';
import {clusterSourceLayerId, togglePointer} from '../components/map/Utils';

interface ExtendedSearchDatum extends SearchDatum {
  center: Coordinate;
  coordinates: Coordinate[];
}

interface ClusterFeatures {
  type: 'Feature';
  properties: {
    id: string,
  };
  geometry: {
    coordinates: Coordinate,
  };
}

interface MapData {
  searchData: ExtendedSearchDatum[];
  features: React.ReactElement<any>[];
  geoJsonClusterData: {
    type: string,
    features: ClusterFeatures[],
  };
}

interface MapSettings {
  default: boolean;
  zoom: [number] | undefined;
  center: Coordinate | undefined;
}

const defaultMapSettings: MapSettings = {
  default: true,
  zoom: [1.4],
  center: undefined,
};

const geoJsonData: CitiesGeoJsonData = JSON.parse(raw('../data/cities.json'));


const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const SearchContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
`;

const Landing = () => {

  const [mapData, setMapData] = useState<MapData>({
    searchData: [],
    features: [],
    geoJsonClusterData: {
      type: 'FeatureCollection',
      features: [],
    },
  });
  const [highlighted, setHighlighted] = useState<ExtendedSearchDatum | null>(null);
  const [hovered, setHovered] = useState<ExtendedSearchDatum | null>(null);
  const [mapSettings, setMapSettings] = useState<MapSettings>(defaultMapSettings);

  const unclusteredPointCallback = (id: string) => {
    const match = mapData.searchData.find(d => d.id === id);
    if (match) {
      setHighlighted(match);
    }
  };

  useEffect(() => {
    const searchData: ExtendedSearchDatum[] = [];
    const features: React.ReactElement<any>[] = [];
    const clusterFeatures: ClusterFeatures[] = [];
    geoJsonData.features.forEach(({properties, geometry: {coordinates}}, i) => {
      const {
        CTR_MN_NM: countryName, CTR_MN_ISO: parent_id, UC_NM_MN: title,
        UC_NM_LST, AREA, GCPNT_LAT, GCPNT_LON,
      } = properties;
      const center: Coordinate = [GCPNT_LON, GCPNT_LAT];
      if (!searchData.find(d => d.id === parent_id)) {
        searchData.push({
          id: parent_id,
          title: countryName,
          parent_id: null,
          level: '0',
          center,
          coordinates: coordinates[0],
        });
      }
      const id = parent_id + '-' + title + '-' + UC_NM_LST + '-' + AREA + '-' + i;
      const searchDatum = {
        id,
        title,
        parent_id,
        level: '1',
        center,
        coordinates: coordinates[0],
      };
      searchData.push(searchDatum);
      const onMouseEnter = (event: any) => {
        setHovered(searchDatum);
        togglePointer(event.map, 'pointer');
      };
      const onMouseLeave = (event: any) => {
        setHovered(null);
        togglePointer(event.map, '');
      };
      features.push(
        <Feature
          coordinates={coordinates[0]}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={() => setHighlighted(searchDatum)}
          key={'geojson-' + id}
        />,
      );
      clusterFeatures.push({
        type: 'Feature',
        properties: { id },
        geometry: { coordinates: center },
      });
    });
    const geoJsonClusterData = {
      type: 'FeatureCollection',
      features: clusterFeatures,
    };
    setMapData({searchData, features, geoJsonClusterData});
  }, []);

  useEffect(() => {
    if (highlighted && highlighted.center && (!mapSettings.center || (
        mapSettings.center[0] !== highlighted.center[0] && mapSettings.center[1] !== highlighted.center[1] ))
    ) {
      setMapSettings({
        default: false,
        zoom: [7],
        center: highlighted.center,
      });
    } else if (highlighted === null && !mapSettings.default) {
      setMapSettings(defaultMapSettings);
    }
  }, [highlighted, mapSettings]);

  const highlightedFeatures: React.ReactElement<any>[] = [];
  if (highlighted) {
    highlightedFeatures.push(
      <Feature
        coordinates={highlighted.coordinates[0]}
        key={'highlighted-' + highlighted.id}
      />,
    );
  }
  if (hovered) {
    highlightedFeatures.push(
      <Feature
        coordinates={hovered.coordinates[0]}
        key={'hovered-' + hovered.id}
      />,
    );
  }

  return (
    <Root>
      <ClusterMap
        zoom={mapSettings.zoom}
        center={mapSettings.center}
        unclusteredPointCallback={unclusteredPointCallback}
      >
        <>
          <GeoJSONLayer
            id={clusterSourceLayerId}
            data={mapData.geoJsonClusterData}
            sourceOptions={{
              cluster: true,
              clusterRadius: 30,
            }}
            filter={['has', 'point_count']}
          />
          <Layer
            id='cluster_count'
            sourceId={clusterSourceLayerId}
            maxZoom={4}
            layerOptions={{
              filter: [
                'has', 'point_count',
              ],
            }}
            paint={{
              'circle-color': {
                property: 'point_count',
                type: 'interval',
                stops: [
                  [0, '#Fcd1c1'],
                  [30, '#Fbc5b1'],
                  [60, '#Faad90'],
                  [90, '#F9a180'],
                  [120, '#F89570'],
                  [1000, '#F89570'],
                ],
              },
              'circle-radius': {
                property: 'point_count',
                type: 'interval',
                stops: [
                  [0, 15],
                  [30, 20],
                  [60, 25],
                  [90, 35],
                  [120, 45],
                  [1000, 45],
                ],
              },
            }}
            type='circle'
          />
          <Layer
            type='circle'
            id={'unclustered_point'}
            maxZoom={4}
            sourceId={clusterSourceLayerId}
            paint={{
              'circle-color': '#Fcd1c1',
              'circle-radius': 5,
            }}
            filter={['!', ['has', 'point_count']]}
          />
          <Layer
            type='symbol'
            id={'clustered_text'}
            maxZoom={4}
            sourceId={clusterSourceLayerId}
            layout={{
              'text-field': '{point_count}',
              'text-font': [
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold',
              ],
              'text-size': 12,
            }}
            paint={{
              'text-color': '#04151b',
            }}
            filter={['has', 'point_count']}
          />

          <Layer
            type='fill'
            id={'primary-map-geojson-layer'}
            paint={{
              'fill-color': '#F89570',
            }}
            minZoom={4}
          >
            {mapData.features}
          </Layer>

          <Layer
            type='line'
            id='directions-layer-extension'
            paint={{
              'line-color': '#Fcd1c1',
              'line-width': {
                base: 2,
                stops: [
                  [1, 1],
                  [5, 1.5],
                  [6, 2],
                  [7, 4],
                  [8, 6],
                  [10, 12],
                ],
              },
            }}
            minZoom={4}
          >
            {highlightedFeatures}
          </Layer>
        </>
      </ClusterMap>
      <SearchContainer>
        <PanelSearch
          data={mapData.searchData}
          topLevelTitle={'Countries'}
          onSelect={(val) => setHighlighted(val as ExtendedSearchDatum)}
          selectedValue={highlighted}
        />
        <button onClick={() => setHighlighted(null)}>
          Clear
        </button>
      </SearchContainer>
    </Root>
  );
};

export default Landing;
