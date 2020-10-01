import React, {useState, useEffect} from 'react';
import ClusterMap from '../../components/map/ClusterLandingMap';
import styled from 'styled-components/macro';
import PanelSearch from 'react-panel-search';
import { Layer, GeoJSONLayer } from 'react-mapbox-gl';
import {
  clusterSourceLayerId,
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
import useFluent from '../../hooks/useFluent';
import {
  ExtendedSearchDatum,
  StyledPopup,
  TootltipTitle,
} from './Utils';
import HighlightedTooltip from './HighlightedTooltip';

interface ClusterFeatures {
  type: 'Feature';
  properties: {
    id: string,
  };
  geometry: {
    coordinates: Coordinate,
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


interface Props {
  searchData: ExtendedSearchDatum[];
  features: React.ReactElement<any>[];
  geoJsonClusterData: {
    type: string,
    features: ClusterFeatures[],
  };
}

const Content = (props: Props) => {
  const {searchData, features, geoJsonClusterData} = props;
  const getString = useFluent();
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
      const childCities = searchData.filter(d => d.parent_id === highlightedCountry.id);
      if (childCities.length === 1) {
        countryPadding = padding;
      }
      setFitBounds({
        bounds: getBounds(highlightedCountry.coordinates),
        padding: countryPadding,
      });
    }
  }, [highlightedCountry, searchData]);

  const unclusteredPointCallback = (id: string) => {
    const match = searchData.find(d => d.id === id);
    if (match) {
      setTimeout(() => setHighlighted(match), 0);
    }
  };

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
            data={geoJsonClusterData}
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
            {features}
          </Layer>

          <Layer
            type='fill'
            id={'highlighted-geojson-layer'}
            paint={{
              'fill-color': secondaryColor,
            }}
            minZoom={4}
          >
            {features.filter(({key}) =>
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
            data={searchData}
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

export default Content;
