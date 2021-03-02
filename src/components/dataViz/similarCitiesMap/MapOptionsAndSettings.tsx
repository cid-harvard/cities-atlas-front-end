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

interface Props {
  showRings: boolean;
  setShowRings: (value: boolean) => void;
}

let previousCityId: string | undefined;

const MapOptionsAndSettings = (props: Props) => {
  const {showRings, setShowRings} = props;
  const mapContext = useMapContext();

  const {data} = useLayoutData();
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();

  const {data: proximityData} = useProximityData();

  useEffect(() => {
    if (mapContext.intialized && data && cityId && cityId !== previousCityId) {
      previousCityId = cityId;
      const currentCityFeature = data.cityGeoJson.features.find(({properties}: {properties: {id: number}}) => properties.id.toString() === cityId);
      if (currentCityFeature) {
        mapContext.setNewCenter(currentCityFeature.geometry.coordinates);
        mapContext.setHighlighted(cityId);
      }
    }
  }, [mapContext, data, cityId]);

  useEffect(() => {
    if (mapContext.intialized && proximityData && cityId) {
      const allValues: number[] = [];
      proximityData.cities.forEach(d => d && d.proximity !== null ? allValues.push(d.proximity) : false);
      const colorScale = createProximityScale([0, ...allValues]);
      const proximityColorMap = proximityData.cities.map(({partnerId, proximity}) => ({
        id: partnerId,
        color: colorScale(proximity ? proximity : 0),
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
            .range([16, 70]);
        const populationSizeByMap = data.cityGeoJson.features.map((f: any) => ({
          id: f.properties.id,
          radius: populationScale(f.properties.population),
        }));
        mapContext.setNodeSizing(populationSizeByMap);
      } else if (nodeSize === CityNodeSizing.gdpPpp) {
        const allGdpPppValues = data.cityGeoJson.features.map((f: any) => f.properties.gdpPpp);
        const minMaxGdpPpp = extent(allGdpPppValues) as unknown as [number, number];
        const gdpPppScale = scaleLinear()
            .domain(minMaxGdpPpp)
            .range([16, 70]);
        const gdpPppSizeByMap = data.cityGeoJson.features.map((f: any) => ({
          id: f.properties.id,
          radius: gdpPppScale(f.properties.gdpPpp),
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
      showRings={showRings}
      setShowRings={setShowRings}
    />
  );
};

export default MapOptionsAndSettings;