import React, {useEffect, useState, useRef} from 'react';
import createChart, {
  defaultNodeRadius,
} from './createChart';
import {RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import {SuccessResponse} from '../similarCitiesMap/useProximityData';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import useGlobalLocationData, {getPopulationScale} from '../../../hooks/useGlobalLocationData';
import {
  lightBaseColor,
} from '../../../styling/styleUtils';
import orderBy from 'lodash/orderBy';
import {createProximityScale} from '../similarCitiesMap/Utils';

type Chart = {
  initialized: false;
} | {
  initialized: true;
};

interface Props {
  width: number;
  height: number;
  data: SuccessResponse | undefined;
}

const Chart = (props: Props) => {
  const {
    width, height, data,
  } = props;

  const cityId = useCurrentCityId();
  const cityData = useGlobalLocationData();
  const chartRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});

  useEffect(() => {
    const chartNode = chartRef.current;
    const tooltipNode = tooltipRef.current;
    if (chartNode) {
      if (chartNode && tooltipNode && data !== undefined && cityId && cityData.data && (
          (chart.initialized === false && width && height)
      )) {
        const populationScale = getPopulationScale(cityData.data, defaultNodeRadius * 0.6, defaultNodeRadius * 2);
        const allValues: number[] = [];
        data.cities.forEach(d => d && d.proximity !== null ? allValues.push(d.proximity) : false);
        const colorScale = createProximityScale([0, ...allValues]);
        const nodes = orderBy(data.cities, ['proximity'], ['desc']).map(c => {
          const city = cityData.data ? cityData.data.cities.find(cc => cc.cityId === c.partnerId) : undefined;
          const country = cityData.data && city && city.countryId
            ? cityData.data.countries.find(cc => city.countryId !== null && cc.countryId === city.countryId.toString())
            : undefined;
          return {
            primary: c.partnerId === cityId,
            id: c.partnerId,
            name: city && city.name ? city.name : c.partnerId,
            country: country && country.nameShortEn ? country.nameShortEn : '',
            color: colorScale(c.proximity ? c.proximity : 0),
            proximity: c.proximity ? c.proximity : 0,
            radius: city && city.population ? populationScale(city.population) : defaultNodeRadius,
          };
        });
        const primaryCity = cityData.data ? cityData.data.cities.find(cc => cc.cityId === cityId) : undefined;
        const primaryCountry = cityData.data && primaryCity && primaryCity.countryId
          ? cityData.data.countries.find(
              cc => primaryCity.countryId !== null && cc.countryId === primaryCity.countryId.toString(),
          ) : undefined;
        if (primaryCity) {
          nodes.push({
            primary: true,
            id: cityId,
            name: primaryCity.name ? primaryCity.name : cityId,
            country: primaryCountry && primaryCountry.nameShortEn ? primaryCountry.nameShortEn : '',
            color: lightBaseColor,
            proximity: 1,
            radius: primaryCity && primaryCity.population
              ? populationScale(primaryCity.population) : defaultNodeRadius,
          });
        }
        chartNode.innerHTML = '';
        createChart({
          rootEl: chartNode,
          data: {nodes},
          rootWidth: width,
          rootHeight: height,
          tooltipEl: tooltipNode,
        });
        setChart({initialized: true });
      }
    }
  }, [chartRef, chart, width, height, data, cityId, cityData]);

  return (
    <>
      <div
        ref={chartRef}
        style={{width, height}}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default Chart;
