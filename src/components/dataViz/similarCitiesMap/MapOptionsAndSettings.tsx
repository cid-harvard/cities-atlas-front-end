import React, {useEffect} from 'react';
import {useMapContext} from 'react-city-space-mapbox';
import useLayoutData, {defaultRadius} from './useLayoutData';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import {createProximityScale} from './Utils';
import SettingsRow from './SettingsRow';
import useProximityData from './useProximityData';
import useQueryParams from '../../../hooks/useQueryParams';
import {
  CityNodeSizing,
  defaultCityNodeSizing,
} from '../../../routing/routes';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import mapboxgl from 'mapbox-gl';

let previousCityId: string | undefined;

const MapOptionsAndSettings = () => {
  const mapContext = useMapContext();

  const {data} = useLayoutData();
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();

  const {data: proximityData} = useProximityData();

  useEffect(() => {
    if (mapContext.intialized) {
      mapContext.map.addControl(new mapboxgl.NavigationControl());
      mapContext.map.scrollZoom.disable();
    }
  }, [mapContext]);

  useEffect(() => {
    if (mapContext.intialized && data && cityId) {
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: number}}) => properties.id.toString() === cityId);
      if (currentCityFeature) {
        if (cityId !== previousCityId) {
          previousCityId = cityId;
          mapContext.setNewCenter(currentCityFeature.geometry.coordinates);
        }
        mapContext.setHighlighted(cityId);
      }
    }
  }, [mapContext, data, cityId]);

  useEffect(() => {
    if (mapContext.intialized && proximityData && cityId) {
      // const allValues: number[] = [];
      // proximityData.cities.forEach(d => d && d.eucdist !== null ? allValues.push(d.eucdist) : false);
      const colorScale = createProximityScale([
        proximityData.cityPartnerEucdistScale.p20GlobalEucdist,
        proximityData.cityPartnerEucdistScale.p40GlobalEucdist,
        proximityData.cityPartnerEucdistScale.p60GlobalEucdist,
        proximityData.cityPartnerEucdistScale.p80GlobalEucdist,
      ]);
      const proximityColorMap = proximityData.cities.map(({partnerId, eucdist}) => ({
        id: partnerId,
        color: colorScale(eucdist ? eucdist : 100),
      }));
      proximityColorMap.push({id: cityId, color: 'gray'});
      mapContext.setColors(proximityColorMap);
    }
  }, [mapContext, data, proximityData, cityId]);

  useEffect(() => {
    if (mapContext.intialized && data && cityId) {
      const nodeSize = city_node_sizing ? city_node_sizing : defaultCityNodeSizing;
      if (nodeSize === CityNodeSizing.population) {
        const allPopulationValues = data.cityGeoJson.features.map((f: any) => f.properties.population);
        const minMaxPopulation = extent(allPopulationValues) as unknown as [number, number];
        const populationScale = scaleLinear()
            .domain(minMaxPopulation)
            .range([24, 100]);
        const populationSizeByMap = data.cityGeoJson.features.map((f: any) => ({
          id: f.properties.id,
          radius: populationScale(f.properties.population),
        }));
        mapContext.setNodeSizing(populationSizeByMap);
      } else if (nodeSize === CityNodeSizing.gdpPpp) {
        const allGdpPppValues = data.cityGeoJson.features.map((f: any) => f.properties.gdppc);
        const minMaxGdpPpp = extent(allGdpPppValues) as unknown as [number, number];
        const gdpPppScale = scaleLinear()
            .domain(minMaxGdpPpp)
            .range([16, 50]);
        const gdpPppSizeByMap = data.cityGeoJson.features.map((f: any) => ({
          id: f.properties.id,
          radius: gdpPppScale(f.properties.gdppc),
        }));
        mapContext.setNodeSizing(gdpPppSizeByMap);
      } else {
        const uniformSizeByMap = data.cityGeoJson.features.map((f: any) => ({
          id: f.properties.id,
          radius: defaultRadius,
        }));
        mapContext.setNodeSizing(uniformSizeByMap);
      }
    }
  }, [mapContext, data, city_node_sizing, cityId]);

  return (
    <SettingsRow
      mapContext={mapContext}
    />
  );
};

export default MapOptionsAndSettings;