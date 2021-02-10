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
  primaryColor,
} from '../../../styling/styleUtils';
import sortBy from 'lodash/sortBy';

type Chart = {
  initialized: false;
} | {
  initialized: true;
};

interface Props {
  width: number;
  height: number;
  data: SuccessResponse | undefined;
  loading: boolean;
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
        const nodes = sortBy(data.cities, ['proximity'], ['asc']).map(c => {
          const city = cityData.data ? cityData.data.cities.find(cc => cc.cityId === c.partnerId) : undefined;
          return {
            primary: c.partnerId === cityId,
            id: c.partnerId,
            name: city && city.name ? city.name : c.partnerId,
            color: c.partnerId === cityId ? primaryColor : lightBaseColor,
            proximity: c.proximity ? c.proximity : 0,
            radius: city && city.population ? populationScale(city.population) : defaultNodeRadius,
          };
        });
        const primaryCity = cityData.data ? cityData.data.cities.find(cc => cc.cityId === cityId) : undefined;
        if (primaryCity) {
          nodes.push({
            primary: true,
            id: cityId,
            name: primaryCity.name ? primaryCity.name : cityId,
            color: primaryColor,
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
