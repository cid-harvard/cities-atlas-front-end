import React from 'react';
import ClusterMap from '../components/map/ClusterLandingMap';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import {CitiesGeoJsonData} from '../data/citiesTypes';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import { Layer, Feature } from 'react-mapbox-gl';

const geoJsonData: CitiesGeoJsonData = JSON.parse(raw('../data/cities.json'));

const searchData: SearchDatum[] = [];

const features: React.ReactElement<any>[] = [];

geoJsonData.features.forEach(({properties, geometry: {coordinates}}, i) => {
  const {
    CTR_MN_NM: countryName, CTR_MN_ISO: parent_id, UC_NM_MN: title,
    UC_NM_LST, AREA,
  } = properties;
  if (!searchData.find(d => d.id === parent_id)) {
    searchData.push({
      id: parent_id,
      title: countryName,
      parent_id: null,
      level: '0',
    });
  }
  const id = parent_id + '-' + title + '-' + UC_NM_LST + '-' + AREA + '-' + i;
  searchData.push({
    id,
    title,
    parent_id,
    level: '1',
  });
  features.push(
    <Feature
      coordinates={coordinates[0]}
      key={'geojson-' + id}
    />,
  );
});

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
  return (
    <Root>
      <ClusterMap
        zoom={[1.4]}
      >
        <Layer
          type='fill'
          id={'primary-map-geojson-layer'}
          paint={{
            'fill-color': '#F89570',
          }}
        >
          {features}
        </Layer>
      </ClusterMap>
      <SearchContainer>
        <PanelSearch
          data={searchData}
          topLevelTitle={'Countries'}
          disallowSelectionLevels={['0']}
        />
      </SearchContainer>
    </Root>
  );
};

export default Landing;
