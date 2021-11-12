import React from 'react';
import styled from 'styled-components/macro';
import { useGlobalLocationGeometry } from '../../../../landing';
import useCurrentCityId from '../../../../../hooks/useCurrentCityId';
import CityMap, { BoundsConfig } from './CityMap';
import { Coordinate, getBounds } from '../../../../../components/map/Utils';
import { ExtendedSearchDatum } from '../../../../landing/Utils';
import { backgroundDark, lightBorderColor, secondaryFont } from '../../../../../styling/styleUtils';

const Root = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #08111e;

  .mapboxgl-control-container {
    .mapboxgl-ctrl-group:not(:empty) {
      background: none;
      box-shadow: none;
    }
    .mapboxgl-ctrl-zoom-in,
    .mapboxgl-ctrl-zoom-out,
    .mapboxgl-ctrl-compass {
      width: 75px;
      height: 18px;
      color: #fff;
      text-transform: uppercase;
      font-family: ${secondaryFont};
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      border: solid 1px ${lightBorderColor};
      border-radius: none;
      background-color: transparent;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.1rem 0.4rem;
      margin-bottom: 0.45rem;

      &:hover {
        background-color: #fff;
        color: ${backgroundDark};
      }

      span {
        display: none;
      }
    }
    .mapboxgl-ctrl-zoom-in {
      &::after {
        text-align: center;
        content: '+ Zoom In';
      }
    }
    .mapboxgl-ctrl-zoom-out {
      &:after {
        text-align: center;
        content: '- Zoom Out';
      }
    }
    .mapboxgl-ctrl-compass {
      display: none;
    }
  }
`;

const MapRoot = () => {
  const { loading, error, data } = useGlobalLocationGeometry();
  const currentCityId = useCurrentCityId();

  let fitBounds: BoundsConfig = { bounds: getBounds([]), padding: { top: 0, bottom: 0, left: 0, right: 0 } };

  if (data !== undefined) {
    const { cities, countries } = data;
    let highlighted: ExtendedSearchDatum | undefined;
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
      const population = population15 ? population15 : 0;
      const gdp = gdppc && !isNaN(gdppc) ? parseFloat(gdppc.toFixed(2)) : 0;
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
      if (cityId === currentCityId) {
        highlighted = searchDatum;
        fitBounds = {
          bounds: getBounds(highlighted.coordinates),
          padding: { top: 150, bottom: 150, left: 150, right: 150 },
        };
      }
    });
  }

  return (
    <Root>
      <CityMap
        loading={loading}
        error={error}
        data={data}
        currentCityId={currentCityId}
        fitBounds={fitBounds}
      />
    </Root>
  );

};

export default MapRoot;
