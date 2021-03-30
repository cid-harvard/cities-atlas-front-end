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
import useCurrentCityId from '../../../hooks/useCurrentCityId';

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

interface FilterValues {
  selectedRegionIds:  string[];
  minMaxPopulation: [number, number];
  minMaxGdpPppPc: [number, number];
}

const SimilarCitiesMap = ({timeStamp}: {timeStamp: number}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const {data} = useLayoutData();
  const {data: proximityData} = useProximityData();
  const [showRings, setShowRings] = useState<boolean>(true);
  const [filterValues, setFilterValues] = useState<FilterValues | undefined>(undefined);
  const cityId = useCurrentCityId();

  useEffect(() => {
    staticProximityData = proximityData;
  }, [proximityData]);

  const renderTooltipContent = (node: {id: string, country: string, city: string, fill: string}) => {
    if (data && staticProximityData) {
      const proximityNode = staticProximityData.cities.find(c => c.partnerId.toString() === node.id.toString());
      return getStandardTooltip({
        title: node.city + ', ' + node.country,
        color: rgba(node.fill, 0.35),
        rows: node.fill !== 'gray'
          ? [['Similarity:', proximityNode && proximityNode.proximity ? proximityNode.proximity.toFixed(2) : '0.00']]
          : [],
        boldColumns: [1],
        hideArrow: true,
      });
    }
    return '';
  };


  let rings: React.ReactElement<any> | null = null;
  let filterBar: React.ReactElement<any> | null;
  if (showRings && filterValues) {
    rings = (
      <RingsContainer>
        <SimilarCitiesRings
          selectedRegionIds={filterValues.selectedRegionIds}
          minMaxPopulation={filterValues.minMaxPopulation}
          minMaxGdpPppPc={filterValues.minMaxGdpPppPc}
          tooltipNode={tooltipRef.current}
        />
      </RingsContainer>
    );
  }
  if (data) {
    let currentCity: {city: string, population: number, gdpPpp: number} | undefined;
    const allPopulations: number[] = [];
    const allGdpPppPc: number[] = [];
    data.cityGeoJson.features.forEach((d: any) => {
      if (d.properties.id === cityId) {
        currentCity = d.properties;
      }
      if (!isNaN(d.properties.population)) {
        allPopulations.push(d.properties.population);
        if (!isNaN(d.properties.gdpPpp)) {
          allGdpPppPc.push(d.properties.gdpPpp / d.properties.population);
        }
      }
    });


    const populationRange = extent(allPopulations) as [number, number];
    const gdpPppPcRange = extent(allGdpPppPc) as [number, number];
    const regions = data.regions;
    filterBar = (
      <FilterBar
        node={filterBarRef.current}
        populationRange={populationRange}
        gdpPppPcRange={gdpPppPcRange}
        regions={regions}
        setFilterValues={setFilterValues}
        currentCity={currentCity}
      />
    );
    if (showRings && !filterValues) {
      rings = (
        <RingsContainer>
          <SimilarCitiesRings
            selectedRegionIds={[]}
            minMaxPopulation={populationRange}
            minMaxGdpPppPc={gdpPppPcRange}
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