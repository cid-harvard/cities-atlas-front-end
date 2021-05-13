import React, {useState, useEffect, useCallback} from 'react';
import ClusterMap from '../../components/map/ClusterLandingMap';
import styled from 'styled-components/macro';
import { Layer, Feature, GeoJSONLayer } from 'react-mapbox-gl';
import {
  clusterSourceLayerId,
  togglePointer,
  Coordinate,
  getBounds,
} from '../../components/map/Utils';
import {
  secondaryColor,
  primaryColor,
  primaryColorRange,
  mapLabelColor,
  secondaryFont,
} from '../../styling/styleUtils';
import Heading from './Heading';
import {
  ExtendedSearchDatum,
  StyledPopup,
  TootltipTitle,
} from './Utils';
import HighlightedTooltip from './HighlightedTooltip';
import { useQuery, gql } from '@apollo/client';
import {
  ClassificationCountry,
  ClassificationCity,
} from '../../types/graphQL/graphQLTypes';
import SimpleLoader from '../../components/transitionStateComponents/SimpleLoader';
import SimpleError from '../../components/transitionStateComponents/SimpleError';
import SearchBar from './SearchBar';
import useFluent from '../../hooks/useFluent';
import Overlay from './Overlay';

const GLOBAL_LOCATION_WITH_GEOMETRY_QUERY = gql`
  query GetGlobalLocationData {
    countries: classificationCountryList {
      countryId
      nameShortEn
      id
    }
    cities: classificationCityList {
      cityId
      name
      nameList
      centroidLat
      centroidLon
      countryId
      geometry
      population15
      gdppc
      id
    }
  }
`;

interface SuccessResponse {
  countries: {
    countryId: ClassificationCountry['countryId'],
    nameShortEn: ClassificationCountry['nameShortEn'],
    id: ClassificationCountry['id'],
  }[];
  cities: {
    cityId: ClassificationCity['cityId'],
    name: ClassificationCity['name'],
    nameList: ClassificationCity['nameList'],
    centroidLat: ClassificationCity['centroidLat'],
    centroidLon: ClassificationCity['centroidLon'],
    countryId: ClassificationCity['countryId'],
    geometry: ClassificationCity['geometry'],
    population15: ClassificationCity['population15'],
    gdppc: ClassificationCity['gdppc'],
    id: ClassificationCity['id'],
  }[];
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

interface BoundsConfig {
  bounds: [Coordinate, Coordinate];
  padding: {top: number, left: number, right: number, bottom: number};
}

let padding: BoundsConfig['padding'];
const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};
if (dimensions.width < 600 || dimensions.height < 600) {
  padding = {
    top: dimensions.height * 0.5,
    bottom: 10,
    right: dimensions.width * 0.1,
    left: dimensions.width * 0.1,
  };
} else if (dimensions.width < 800 || dimensions.height < 800) {
  padding = {
    top: dimensions.height * 0.25,
    bottom: dimensions.height * 0.1,
    right: dimensions.width * 0.1,
    left: dimensions.width * 0.4,
  };
} else {
  padding = {
    top: dimensions.height * 0.25,
    bottom: dimensions.height * 0.1,
    right: dimensions.width * 0.1,
    left: dimensions.width / 2,
  };
}

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #08111e;
`;

const SidePanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  padding: 1rem;
  box-sizing: border-box;

  @media (min-width: 750px) {
    width: 40vw;
    max-width: 600px;
    min-width: 400px;
    bottom: 0;
    z-index: 200;
  }
`;

const SearchContainer = styled.div`
  pointer-events: all;
  width: 100%;
  margin: auto;

  @media (min-width: 990px) {
    width: 85%;
  }

  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-size: 0.85rem;
    background-color: rgba(0, 0, 0, 0.85);
    color: #fff;
    border: solid 1px #fff;
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-right: 3rem;
    box-shadow: none;
    outline: none;

    &::placeholder {
      color: #fff;
    }

    &:focus::placeholder {
      color: rgba(0, 0, 0, 0);
    }
  }

  .react-panel-search-search-bar-dropdown-arrow {
    background-color: transparent;

  }
  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: #fff;
    }
  }

  .react-panel-search-search-bar-clear-button {
    background-color: transparent;
    color: #fff;
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: #fff;
    }
  }

  .react-panel-search-search-results {
    background-color: rgba(0, 0, 0, 0.85);
    border: solid 1px #fff;

    ::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, .3);
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, .1);
    }
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    color: #fff;
    border-color: ${primaryColor};
  }

  .react-panel-search-current-tier-breadcrumb-outer:hover {
    background-color: rgba(255, 255, 255, 0.35);
  }

  .react-panel-search-list-item {
    background-color: transparent;
    color: #fff;
    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.35);
  }

  .react-panel-search-search-results:hover {
    .react-panel-search-highlighted-item:not(:hover) {
      background-color: transparent;
    }
  }

  .react-panel-search-list-item-container {
    strong {
      color: ${primaryColor};
    }
  }

  .react-panel-search-list-item-container.react-panel-search-list-no-results {
    color: #fff;
  }
`;

const LoadingContainer = styled.div`
  font-size: 1rem;
  line-height: 0;
  display: flex;
  align-items: center;
  height: 3.1875rem;
  text-transform: uppercase;
  font-size: 0.85rem;
  background-color: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.75);
  border: solid 1px #fff;
  padding-left: 0.5rem;
`;

const Landing = () => {
  const {loading, error, data} = useQuery<SuccessResponse, never>(GLOBAL_LOCATION_WITH_GEOMETRY_QUERY);
  const getString = useFluent();

  const [mapData, setMapData] = useState<MapData>({
    searchData: [],
    features: [],
    geoJsonClusterData: {
      type: 'FeatureCollection',
      features: [],
    },
  });
  const [overlayOn, setOverlayOn] = useState<boolean>(true);
  const closeOverlay = () => setOverlayOn(false);
  const [highlighted, setHighlighted] = useState<ExtendedSearchDatum | null>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<ExtendedSearchDatum | null>(null);
  const [hovered, setHovered] = useState<ExtendedSearchDatum | null>(null);
  const [fitBounds, setFitBounds] = useState<BoundsConfig>({bounds: getBounds([]), padding: {top: 0, bottom: 0, left: 0, right: 0}});

  useEffect(() => {
    if (highlighted) {
      setFitBounds({
        bounds: getBounds(highlighted.coordinates),
        padding,
      });
      closeOverlay();
    }
  }, [highlighted]);

  useEffect(() => {
    if (highlightedCountry) {
      let countryPadding: BoundsConfig['padding'] = {top: 50, bottom: 50, left: 50, right: 50};
      const childCities = mapData.searchData.filter(d => d.parent_id === highlightedCountry.id);
      if (childCities.length === 1) {
        countryPadding = padding;
      }
      setFitBounds({
        bounds: getBounds(highlightedCountry.coordinates),
        padding: countryPadding,
      });
    }
  }, [highlightedCountry, mapData]);

  useEffect(() => {
    if (data !== undefined) {
      const searchData: ExtendedSearchDatum[] = [];
      const features: React.ReactElement<any>[] = [];
      const clusterFeatures: ClusterFeatures[] = [];
      const {cities, countries} = data;
      cities.forEach(city => {
        const {
          cityId, name, centroidLon, countryId, geometry,
          population15, gdppc, nameList,
        } = city;
        const coordinates: Coordinate[][][] = geometry ? JSON.parse(geometry).coordinates : [];
        const northernTerminus = Math.max(...coordinates[0][0].map(coord => coord[1]));
        const center: Coordinate = [centroidLon ? centroidLon : 0, northernTerminus];
        const parent = countries.find(c => parseInt(c.countryId, 10) === countryId);
        const countryName = parent && parent.nameShortEn ? parent.nameShortEn : '';
        const parentIndex = searchData.findIndex(d => d.id === countryId);
        const population = population15 ? population15 : 0;
        const gdp = gdppc && !isNaN(gdppc) ? parseFloat(gdppc.toFixed(2)) : 0;
        if (parentIndex === -1 && parent !== undefined && countryId !== null && parent.nameShortEn) {
          searchData.push({
            id: countryId,
            title: countryName,
            parent_id: null,
            level: '0',
            center,
            population: Math.round(population),
            gdp,
            coordinates: coordinates[0][0],
          });
        } else if (parentIndex !== -1) {
          searchData[parentIndex].coordinates = [...searchData[parentIndex].coordinates, ...coordinates[0][0]];
          searchData[parentIndex].gdp += gdp;
          searchData[parentIndex].population += population;
        } else {
          console.error(city);
        }
        const id = cityId;
        const searchDatum: ExtendedSearchDatum = {
          id,
          title: name + ', ' + countryName,
          parent_id: countryId,
          level: '1',
          center,
          coordinates: coordinates[0][0],
          population: Math.round(population),
          gdp,
          keywords: nameList ? nameList : undefined,
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
        const onClick = () => setTimeout(() => setHighlighted(searchDatum), 0);
        features.push(
          <Feature
            coordinates={coordinates[0]}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
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
    }
  }, [data]);

  const hoveredTooltipPopup = hovered && (!highlighted || highlighted.id !== hovered.id) ? (
    <StyledPopup
      coordinates={hovered.center}
    >
      <TootltipTitle>
        {hovered.title}
      </TootltipTitle>
    </StyledPopup>
  ) : null;

  const highlightedTooltipPopup = highlighted && highlighted.parent_id !== null ? (
    <HighlightedTooltip
      highlighted={highlighted}
      closePopup={() => setHighlighted(null)}
    />
  ) : null;

  const onPanelHover = useCallback((val: ExtendedSearchDatum | null) => {
    if (val && val.parent_id !== null) {
      setHovered(val);
    } else {
      setHovered(null);
    }
  }, [setHovered]);

  const onTraverseLevel = useCallback((val: ExtendedSearchDatum, direction: 'asc' | 'desc') => {
    if (direction === 'asc' && val.parent_id === null) {
      setFitBounds({
        bounds: getBounds([]),
        padding: {top: 0, bottom: 0, left: 0, right: 0},
      });
    }
    setHighlightedCountry(val as ExtendedSearchDatum);
  }, [setHighlightedCountry, setFitBounds]);

  const unclusteredPointCallback = (id: string) => {
    const match = mapData.searchData.find(d => d.id === id);
    if (match) {
      setTimeout(() => setHighlighted(match), 0);
    }
  };

  let mapContent: React.ReactElement<any>;
  let searchBar: React.ReactElement<any>;
  if (loading === true) {
    mapContent = <></>;
    searchBar = (
      <LoadingContainer>
        <SimpleLoader />
        {getString('global-ui-loading-cities')}...
      </LoadingContainer>
    );
  } else if (error !== undefined) {
    console.error(error);
    mapContent = <></>;
    searchBar = (
      <LoadingContainer>
        <SimpleError color={'white'} />
      </LoadingContainer>
    );
  } else if (data !== undefined) {
    mapContent = (
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
                  [0, primaryColorRange[4]],
                  [30, primaryColorRange[3]],
                  [60, primaryColorRange[2]],
                  [90, primaryColorRange[1]],
                  [120, primaryColorRange[0]],
                  [1000, primaryColorRange[0]],
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
              'circle-color': primaryColorRange[4],
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
              'text-color': mapLabelColor,
            }}
            filter={['has', 'point_count']}
          />

          <Layer
            type='fill'
            id={'primary-map-geojson-layer'}
            paint={{
              'fill-color': primaryColor,
            }}
            minZoom={4}
            before={'road-simple'}
          >
            {mapData.features}
          </Layer>

          <Layer
            type='fill'
            id={'highlighted-geojson-layer'}
            paint={{
              'fill-color': secondaryColor,
            }}
            minZoom={4}
            before={'road-simple'}
          >
            {mapData.features.filter(({key}) =>
              (highlighted && key === 'geojson-' + highlighted.id) ||
              (hovered && key === 'geojson-' + hovered.id),
            )}
          </Layer>
          {highlightedTooltipPopup}
          {hoveredTooltipPopup}
        </>
    );
    searchBar = (
      <SearchBar
        data={mapData.searchData}
        setHighlighted={setHighlighted}
        onPanelHover={onPanelHover}
        onTraverseLevel={onTraverseLevel}
        highlighted={highlighted}
      />
    );
  } else {
    mapContent = <></>;
    searchBar = <></>;
  }

  const overlay = overlayOn ? <Overlay onCitySelect={closeOverlay} /> : (
    <SidePanel>
      <Heading />
      <SearchContainer
        onMouseDown={() => setHovered(null)}
      >
        {searchBar}
      </SearchContainer>
    </SidePanel>
  );

  return (
    <Root>

      <ClusterMap
        unclusteredPointCallback={unclusteredPointCallback}
        clearPopup={() => setHighlighted(null)}
        fitBounds={fitBounds.bounds}
        padding={fitBounds.padding}
      >
        {mapContent}
      </ClusterMap>
      {overlay}
    </Root>
  );

};

export default Landing;
