import React, {useRef, useEffect, useState} from 'react';
import CitySpaceMap from 'react-city-space-mapbox';
import useLayoutData from './useLayoutData';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import MapOptionsAndSettings from './MapOptionsAndSettings';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';
import useProximityData, {SuccessResponse} from './useProximityData';
import SimilarCitiesRings from '../simpleRings/SimilarCitiesRings';
import CityProximityLegend from '../legend/CityProximityLegend';
import FilterBar, {filterBarId} from './FilterBar';
import {extent} from 'd3-array';
import {RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import {defaultYear} from '../../../Utils';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import {ordinalNumber} from '../../../hooks/useFluent';
import orderBy from 'lodash/orderBy';
import upperFirst from 'lodash/upperFirst';
import {
  backgroundDark,
  secondaryFont,
  lightBorderColor,
} from '../../../styling/styleUtils';

const Root = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  grid-column: 1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  .mapboxgl-control-container {
    .mapboxgl-ctrl-group:not(:empty) {
      background: none;
      box-shadow: none;
      margin-top: 2rem;
    }
    .mapboxgl-ctrl-zoom-in,
    .mapboxgl-ctrl-zoom-out,
    .mapboxgl-ctrl-compass {
      width: 75px;
      height: 18px;
      color: ${backgroundDark};
      text-transform: uppercase;
      font-family: ${secondaryFont};
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      border: solid 1px ${lightBorderColor};
      background-color: #fff;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.1rem 0.4rem;
      margin-bottom: 0.45rem;

      &:hover {
        background-color: ${backgroundDark};
        color: #fff;
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

const Map = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

const RingsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 5;
`;

const FilterBarContainer = styled.div`
  position: absolute;
  z-index: 6;
  width: 100%;
  top: 0;
`;

let staticProximityData: SuccessResponse | undefined;
let staticFilterValues: FilterValues | undefined;
let staticCityId: string | null;

interface FilterValues {
  selectedRegionIds:  string[];
  selectedCountryIds:  string[];
  minMaxPopulation: [number, number];
  minMaxGdppc: [number, number];
}

const SimilarCitiesMap = ({timeStamp}: {timeStamp: number | string}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const {data} = useLayoutData();
  const {data: proximityData} = useProximityData();
  const [showRings, setShowRings] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState<FilterValues | undefined>(undefined);
  const cityId = useCurrentCityId();

  useEffect(() => {
    staticProximityData = proximityData;
  }, [proximityData, cityId]);

  useEffect(() => {
    staticFilterValues = filterValues;
  }, [filterValues, cityId]);

  useEffect(() => {
    staticCityId = cityId;
  }, [cityId]);

  useEffect(() => {
    // hack needed to handle issues with mapbox and d3 rendering contexts
    // initial showRings state should be opposite of what is desired, and flip
    // it here
    setShowRings(true);
  }, [timeStamp]);

  const renderTooltipContent =
    (node: {id: string, country: string, city: string, fill: string}) => {
    if (data && staticProximityData) {
      const sorted = orderBy(data.cityGeoJson.features, (d: any) => {
        const proximityDatum = (staticProximityData as SuccessResponse).cities.find(
          dd => dd.partnerId === d.properties.id);
        if (proximityDatum) {
          return proximityDatum.eucdist;
        } else {
          return 100;
        }
      });

      const filtered = sorted.filter(({properties: d}: any) => {
        const shown =
          d.id !== staticCityId &&
          (staticFilterValues === undefined || (
          d.population >= staticFilterValues.minMaxPopulation[0] &&
          d.population <= staticFilterValues.minMaxPopulation[1] &&
          d.gdppc >= staticFilterValues.minMaxGdppc[0] &&
          d.gdppc <= staticFilterValues.minMaxGdppc[1] &&
          (!staticFilterValues.selectedRegionIds.length ||
            (d.region !== null && staticFilterValues.selectedRegionIds.includes(d.region.toString()))) &&
          (!staticFilterValues.selectedCountryIds.length ||
            (d.countryId !== null && d.countryId !== undefined &&
              staticFilterValues.selectedCountryIds.includes(d.countryId)))
            ))
              ? true : false;
        return shown;
      });
      // add one to the rank to account for 0 start arrays
      const rankInFiltered =
        filtered.findIndex((dd: any) => dd.properties.id === node.id) + 1;
      const rankInAll =
        sorted.findIndex((dd: any) => dd.properties.id === node.id) + 1;
      const rows = [['Year:', defaultYear.toString()]];
      if (rankInFiltered > 0) {
        rows.push(
          [
            'Similarity rank,<br />filtered cities only:',
            // the current city has already been deducted from the count
            ordinalNumber([rankInFiltered]) + ' of ' + filtered.length],
          [
            'Similarity rank,<br />all Metroverse cities:',
            // subtract one to not include the current city
            ordinalNumber([rankInAll]) + ' of ' + (sorted.length - 1)],
        );
      }
      if (rankInFiltered > 0 || node.id === staticCityId) {
        return getStandardTooltip({
          title: node.city + ', ' + node.country,
          color: rgba(node.fill, 0.35),
          rows,
          boldColumns: [1],
          hideArrow: true,
          simple: true,
        });
      } else  return null;
    }
    return null;
  };

  let rings: React.ReactElement<any> | null = null;
  let filterBar: React.ReactElement<any> | null;
  if (showRings && filterValues) {
    rings = (
      <RingsContainer>
        <SimilarCitiesRings
          selectedRegionIds={filterValues.selectedRegionIds}
          selectedCountryIds={filterValues.selectedCountryIds}
          minMaxPopulation={filterValues.minMaxPopulation}
          minMaxGdppc={filterValues.minMaxGdppc}
          tooltipNode={tooltipRef.current}
        />
      </RingsContainer>
    );
  }
  if (data) {
    let currentCity: {city: string, population: number, gdppc: number} | undefined;
    const allPopulations: number[] = [];
    const allGdppc: number[] = [];
    data.cityGeoJson.features.forEach((d: any) => {
      if (d.properties.id === cityId) {
        currentCity = d.properties;
      }
      if (!isNaN(d.properties.population)) {
        allPopulations.push(d.properties.population);
        if (!isNaN(d.properties.gdppc)) {
          allGdppc.push(d.properties.gdppc);
        }
      }
    });

    const populationRange = extent(allPopulations) as [number, number];
    const gdppcRange = extent(allGdppc) as [number, number];
    const regions = data.regions.map(d => ({...d, label: upperFirst(d.label)}));
    const countries = data.countries;
    filterBar = (
      <FilterBar
        node={filterBarRef.current}
        // adjust min max values so that all other values fall within them
        populationMin={Math.floor(populationRange[0]) - 1000}
        populationMax={Math.ceil(populationRange[1]) + 100000}
        gdppcMin={Math.floor(gdppcRange[0]) - 1000}
        gdppcMax={Math.ceil(gdppcRange[1]) + 100000}
        regions={regions}
        countries={countries}
        setFilterValues={setFilterValues}
        currentCity={currentCity}
      />
    );
    if (showRings && !filterValues) {
      rings = (
        <RingsContainer>
          <SimilarCitiesRings
            selectedRegionIds={[]}
            selectedCountryIds={[]}
            minMaxPopulation={populationRange}
            minMaxGdppc={gdppcRange}
            tooltipNode={tooltipRef.current}
          />
        </RingsContainer>
      );
    }
  } else {
    filterBar = null;
  }

  return (
    <>
      <Root>
        <FilterBarContainer ref={filterBarRef} id={filterBarId} />
        <MapContainer>
          <Map ref={rootRef} />
          {rings}
        </MapContainer>
      </Root>
      <CitySpaceMap
        accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as  string}
        mapStyle={'mapbox://styles/harvardgrowthlab/ckelvcgh70cg019qgiu39035a'}
        rootRef={rootRef}
        cityGeoJson={data ? data.cityGeoJson : undefined}
        cityUMapJson={data ? data.cityUMapJson : undefined}
        getPopupHTMLContent={renderTooltipContent}
      >
        <MapOptionsAndSettings
          showRings={showRings}
          setShowRings={setShowRings}
          timeStamp={timeStamp}
        />
        {filterBar}
      </CitySpaceMap>
      <CityProximityLegend isRings={showRings} />
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default SimilarCitiesMap;