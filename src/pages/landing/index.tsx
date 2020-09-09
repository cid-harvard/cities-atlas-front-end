import React, {useState, useEffect} from 'react';
import ClusterMap from '../../components/map/ClusterLandingMap';
import styled, {keyframes} from 'styled-components/macro';
import raw from 'raw.macro';
import {CitiesGeoJsonData} from '../../data/citiesTypes';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import { Layer, Feature, GeoJSONLayer, Popup } from 'react-mapbox-gl';
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
import {numberWithCommas} from '../../Utils';
import Heading from './Heading';
import {Link} from 'react-router-dom';
import {CityRoutes} from '../../routing/routes';
import {createRoute} from '../../routing/Utils';
import useFluent from '../../hooks/useFluent';

interface ExtendedSearchDatum extends SearchDatum {
  center: Coordinate;
  coordinates: Coordinate[];
  population: number;
  gdp: number;
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

const geoJsonData: CitiesGeoJsonData = JSON.parse(raw('../../data/cities.json'));

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

const bounceRight = keyframes`
  0%,
  20%,
  50%,
  80%,
  100% {
    left: 0;
  }

  40% {
    left: 0.7rem;
  }

  60% {
    left: 0.3rem;
  }
`;

const bounceDuration = '1'; // in seconds

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
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
    background-color: rgba(0, 0, 0, 0.35);
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
    background-color: rgba(0, 0, 0, 0.35);
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
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-list-item {
    background-color: transparent;
    color: #fff;
    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-search-results:hover {
    .react-panel-search-highlighted-item:not(:hover) {
      background-color: transparent;
    }
  }
`;

const StyledPopup = styled(Popup)`
  .mapboxgl-popup-content {
    border-radius: 0;
    padding: 1rem 1.1rem;
    position: relative;
    background-color: ${secondaryColor};
    color: #fff;
    font-family: ${secondaryFont};
    pointer-events: none;
  }

  .mapboxgl-popup-tip {
    visibility: hidden;
  }
`;

const TootltipTitle = styled.h2`
  text-transform: uppercase;
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  text-align: center;
`;

const TootlipContent = styled.p`
  color: #fff;
  font-size: 0.85rem;
  text-align: center;
  margin: 1rem 0;
  line-height: 1.7;
`;

const ReviewCityButton = styled(Link)`
  font-family: ${secondaryFont};
  text-transform: uppercase;
  font-size: 1.1rem;
  display: block;
  width: 100%;
  padding: 0.7rem;
  display: block;
  box-sizing: border-box;
  background-color: #fff;
  text-align: center;
  color: ${secondaryColor};
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
  transform-origin: top;
  pointer-events: all;
  text-decoration: none;

  &:hover {
    transform: scale(1.1);

    span {
      animation: ${bounceRight} ${bounceDuration}s ease-in-out infinite;
    }
  }
`;

const Arrow = styled.span`
  font-family: Verdana, sans-serif;
  font-size: 1.5rem;
  line-height: 0;
  position: relative;
  top: 0.2rem;
`;

const CloseTooltipButton = styled.button`
  position: absolute;
  font-size: 1rem;
  top: 0;
  right: 0;
  padding: 0.2rem;
  color: #fff;
  background-color: transparent;
  border: none;
  box-shadow: none;
  pointer-events: all;
`;

const Landing = () => {
  const getString = useFluent();
  const [mapData, setMapData] = useState<MapData>({
    searchData: [],
    features: [],
    geoJsonClusterData: {
      type: 'FeatureCollection',
      features: [],
    },
  });
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
    }
  }, [highlighted]);

  const onTraverseLevel = (val: ExtendedSearchDatum, direction: 'asc' | 'desc') => {
    if (direction === 'asc' && val.parent_id === null) {

      setFitBounds({
        bounds: getBounds([]),
        padding: {top: 0, bottom: 0, left: 0, right: 0},
      });
    }
    setHighlightedCountry(val as ExtendedSearchDatum);
  };
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

  const unclusteredPointCallback = (id: string) => {
    const match = mapData.searchData.find(d => d.id === id);
    if (match) {
      setTimeout(() => setHighlighted(match), 0);
    }
  };

  useEffect(() => {
    const searchData: ExtendedSearchDatum[] = [];
    const features: React.ReactElement<any>[] = [];
    const clusterFeatures: ClusterFeatures[] = [];
    geoJsonData.features.forEach(({properties, geometry: {coordinates}}) => {
      const {
        CTR_MN_NM: countryName, CTR_MN_ISO: parent_id, UC_NM_MN: title,
        GCPNT_LON, P15, GDP15_SM, ID_HDC_G0,
      } = properties;
      const northernTerminus = Math.max(...coordinates[0][0].map(coord => coord[1]));
      const center: Coordinate = [GCPNT_LON, northernTerminus];
      const parentIndex = searchData.findIndex(d => d.id === parent_id);
      if (parentIndex === -1) {
        searchData.push({
          id: parent_id,
          title: countryName,
          parent_id: null,
          level: '0',
          center,
          population: Math.round(P15),
          gdp: GDP15_SM,
          coordinates: coordinates[0][0],
        });
      } else {
        searchData[parentIndex].coordinates = [...searchData[parentIndex].coordinates, ...coordinates[0][0]];
        searchData[parentIndex].gdp += GDP15_SM;
        searchData[parentIndex].population += P15;
      }
      const id = ID_HDC_G0.toString();
      const searchDatum: ExtendedSearchDatum = {
        id,
        title: title + ', ' + countryName,
        parent_id,
        level: '1',
        center,
        coordinates: coordinates[0][0],
        population: Math.round(P15),
        gdp: GDP15_SM,
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
  }, []);

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
    <StyledPopup
      coordinates={highlighted.center}
    >
      <TootltipTitle>
        {highlighted.title}
      </TootltipTitle>
      <TootlipContent>
        {getString('global-text-population')}: {numberWithCommas(highlighted.population)}
        <br />
        {getString('global-text-gdp-per-capita')}: ${numberWithCommas(highlighted.gdp)}
      </TootlipContent>
      <ReviewCityButton to={createRoute.city(CityRoutes.CityBase, highlighted.id.toString())}>
        {getString('landing-page-text-review-the-city')} <Arrow>→</Arrow>
      </ReviewCityButton>
      <CloseTooltipButton onClick={() => setHighlighted(null)}>×</CloseTooltipButton>
    </StyledPopup>
  ) : null;

  const onPanelHover = (val: ExtendedSearchDatum | null) => {
    if (val && val.parent_id !== null) {
      setHovered(val);
    } else {
      setHovered(null);
    }
  };

  return (
    <Root>
      <ClusterMap
        unclusteredPointCallback={unclusteredPointCallback}
        clearPopup={() => setHighlighted(null)}
        fitBounds={fitBounds.bounds}
        padding={fitBounds.padding}
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
          >
            {mapData.features.filter(({key}) =>
              (highlighted && key === 'geojson-' + highlighted.id) ||
              (hovered && key === 'geojson-' + hovered.id),
            )}
          </Layer>
          {highlightedTooltipPopup}
          {hoveredTooltipPopup}
        </>
      </ClusterMap>
      <SidePanel>
        <Heading />
        <SearchContainer
          onMouseDown={() => setHovered(null)}
        >
          <PanelSearch
            data={mapData.searchData}
            topLevelTitle={getString('global-text-countries')}
            onSelect={(val) => setHighlighted(val as ExtendedSearchDatum)}
            onHover={onPanelHover}
            onTraverseLevel={onTraverseLevel}
            selectedValue={highlighted}
            disallowSelectionLevels={['0']}
            defaultPlaceholderText={getString('global-ui-type-a-city-name')}
            showCount={true}
            resultsIdentation={1.75}
          />
        </SearchContainer>
      </SidePanel>
    </Root>
  );
};

export default Landing;
