import React, { useEffect, useState, useRef } from "react";
import createChart, { defaultNodeRadius } from "./createChart";
import { SuccessResponse } from "../similarCitiesMap/useProximityData";
import useCurrentCityId from "../../../hooks/useCurrentCityId";
import useGlobalLocationData, {
  getPopulationScale,
  getGdpPppScale,
} from "../../../hooks/useGlobalLocationData";
import { lightBaseColor } from "../../../styling/styleUtils";
import orderBy from "lodash/orderBy";
import { createProximityScale } from "../similarCitiesMap/Utils";
import useQueryParams from "../../../hooks/useQueryParams";
import { CityNodeSizing, defaultCityNodeSizing } from "../../../routing/routes";

type Chart =
  | {
      initialized: false;
    }
  | {
      initialized: true;
    };

interface Props {
  width: number;
  height: number;
  data: SuccessResponse | undefined;
  selectedRegionIds: string[];
  selectedCountryIds: string[];
  minMaxPopulation: [number, number];
  minMaxGdppc: [number, number];
  tooltipNode: HTMLDivElement | null;
}

const Chart = (props: Props) => {
  const {
    width,
    height,
    data,
    minMaxPopulation,
    minMaxGdppc,
    selectedRegionIds,
    tooltipNode,
    selectedCountryIds,
  } = props;

  const cityId = useCurrentCityId();
  const { city_node_sizing } = useQueryParams();
  const cityData = useGlobalLocationData();
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({ initialized: false });

  useEffect(() => {
    const chartNode = chartRef.current;

    const [minPop, maxPop] = minMaxPopulation;
    const [minGdppc, maxGdppc] = minMaxGdppc;

    if (chartNode) {
      if (
        chartNode &&
        tooltipNode &&
        data !== undefined &&
        cityId &&
        cityData.data &&
        chart.initialized === false &&
        width &&
        height
      ) {
        let radiusScale: (value: number) => number;
        const nodeSizing = city_node_sizing
          ? city_node_sizing
          : defaultCityNodeSizing;
        if (nodeSizing === CityNodeSizing.population) {
          radiusScale = getPopulationScale(
            cityData.data,
            defaultNodeRadius * 0.45,
            defaultNodeRadius * 1.25,
          ) as (val: number) => number;
        } else if (nodeSizing === CityNodeSizing.gdpPpp) {
          radiusScale = getGdpPppScale(
            cityData.data,
            defaultNodeRadius * 0.45,
            defaultNodeRadius * 1.25,
          ) as (val: number) => number;
        } else {
          radiusScale = (_unused: any) => defaultNodeRadius;
        }
        const colorScale = createProximityScale([
          data.cityPartnerEucdistScale.p20GlobalEucdist,
          data.cityPartnerEucdistScale.p40GlobalEucdist,
          data.cityPartnerEucdistScale.p60GlobalEucdist,
          data.cityPartnerEucdistScale.p80GlobalEucdist,
        ]);
        const nodes = orderBy(data.cities, ["eucdist"], ["asc"]).map((c) => {
          const city = cityData.data
            ? cityData.data.cities.find((cc) => cc.cityId === c.partnerId)
            : undefined;
          const country =
            cityData.data && city && city.countryId
              ? cityData.data.countries.find(
                  (cc) =>
                    city.countryId !== null &&
                    cc.countryId === city.countryId.toString(),
                )
              : undefined;
          const radius = city
            ? nodeSizing === CityNodeSizing.population
              ? (city.population as number)
              : (city.gdppc as number)
            : defaultNodeRadius;
          const population = city && city.population ? city.population : 0;
          const gdppc = city && city.gdppc ? city.gdppc : 0;
          const region =
            city && city.region !== null ? city.region.toString() : null;
          const shown =
            population >= minPop &&
            population <= maxPop &&
            gdppc >= minGdppc &&
            gdppc <= maxGdppc &&
            (!selectedRegionIds.length ||
              (region !== null && selectedRegionIds.includes(region))) &&
            (!selectedCountryIds.length ||
              (country !== null &&
                country !== undefined &&
                selectedCountryIds.includes(country.countryId)))
              ? true
              : false;
          return {
            primary: c.partnerId === cityId,
            id: c.partnerId,
            name: city && city.name ? city.name : c.partnerId,
            country: country && country.nameShortEn ? country.nameShortEn : "",
            color: colorScale(c.eucdist ? c.eucdist : 100),
            proximity: c.eucdist ? c.eucdist : 100,
            radius: radiusScale(radius),
            shown: c.partnerId === cityId || shown,
          };
        });
        const primaryCity = cityData.data
          ? cityData.data.cities.find((cc) => cc.cityId === cityId)
          : undefined;
        const primaryCountry =
          cityData.data && primaryCity && primaryCity.countryId
            ? cityData.data.countries.find(
                (cc) =>
                  primaryCity.countryId !== null &&
                  cc.countryId === primaryCity.countryId.toString(),
              )
            : undefined;

        const radiusValue = primaryCity
          ? nodeSizing === CityNodeSizing.population
            ? (primaryCity.population as number)
            : (primaryCity.gdppc as number)
          : defaultNodeRadius;
        if (primaryCity) {
          nodes.push({
            primary: true,
            id: cityId,
            name: primaryCity.name ? primaryCity.name : cityId,
            country:
              primaryCountry && primaryCountry.nameShortEn
                ? primaryCountry.nameShortEn
                : "",
            color: lightBaseColor,
            proximity: 0,
            radius: radiusScale(radiusValue),
            shown: true,
          });
        }
        chartNode.innerHTML = "";
        createChart({
          rootEl: chartNode,
          data: { nodes },
          rootWidth: width,
          rootHeight: height,
          tooltipEl: tooltipNode,
        });
        setChart({ initialized: true });
      }
    }
  }, [
    chartRef,
    chart,
    width,
    height,
    data,
    cityId,
    cityData,
    city_node_sizing,
    minMaxPopulation,
    minMaxGdppc,
    selectedRegionIds,
    tooltipNode,
    selectedCountryIds,
  ]);

  return (
    <>
      <div ref={chartRef} style={{ height }} />
    </>
  );
};

export default Chart;
