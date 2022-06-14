import CITIES_UMAPJSON_RAW from './data/cities-umap.json';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import { useQuery, gql } from '@apollo/client';
import {point, featureCollection} from '@turf/helpers';
import {
  ClassificationCountry,
  ClassificationCity,
  ClassificationRegion,
} from '../../../types/graphQL/graphQLTypes';
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';

export const defaultRadius = 20;

const GLOBAL_LOCATION_WITH_GEOMETRY_QUERY = gql`
  query GetGlobalLocationData {
    countries: classificationCountryList {
      countryId
      nameShortEn
      regionId
      id
    }
    cities: classificationCityList {
      cityId
      name
      centroidLat
      centroidLon
      countryId
      population: populationLatest
      gdppc
      region: regionId
      id
    }
    regions: classificationRegionList {
      regionId
      regionName
    }
  }
`;

interface SuccessResponse {
  countries: {
    countryId: ClassificationCountry['countryId'],
    nameShortEn: ClassificationCountry['nameShortEn'],
    regionId: ClassificationCountry['regionId'],
    id: ClassificationCountry['id'],
  }[];
  cities: {
    cityId: ClassificationCity['cityId'],
    name: ClassificationCity['name'],
    centroidLat: ClassificationCity['centroidLat'],
    centroidLon: ClassificationCity['centroidLon'],
    countryId: ClassificationCity['countryId'],
    population: ClassificationCity['populationLatest'],
    gdppc: ClassificationCity['gdppc'],
    region: ClassificationCity['regionId'],
    id: ClassificationCity['id'],
  }[];
  regions: {
    regionId: ClassificationRegion['regionId'];
    regionName: ClassificationRegion['regionName'];
  }[];
}

interface Output {
  loading: boolean;
  error: any | undefined;
  data: {
    cityGeoJson: any;
    cityUMapJson: any;
    regions: {label: string, value: string}[];
    countries: {label: string, value: string, regionId: string}[];
  } | undefined;
}

const useLayoutData = (): Output => {
  const {loading, error, data: responseData} = useQuery<SuccessResponse, never>(GLOBAL_LOCATION_WITH_GEOMETRY_QUERY);

  let data: Output['data'];
  if (responseData) {
    const allLatCoords: number[] = [];
    const allLngCoords: number[] = [];

    const filteredResponseCities = responseData.cities;
    // const filteredResponseCities = responseData.cities
      // .filter(city => CITIES_UMAPJSON_RAW.find(umap => umap.ID_HDC_G0.toString() === city.cityId.toString()));

    const filteredUMapCities = CITIES_UMAPJSON_RAW
      .filter(umap => responseData.cities.find(city => umap.ID_HDC_G0.toString() === city.cityId.toString()));

    const regions = uniqBy(responseData.regions, 'regionId')
      .map(r => ({label: r.regionName, value: r.regionId}));

    const countries: {label: string, value: string, regionId: string}[] = [];
    const cityGeoJson = featureCollection(filteredResponseCities.map(city => {
      const {name, centroidLat, centroidLon, cityId, countryId, population, gdppc} = city;
      const coordinates: [number, number] = centroidLat && centroidLon ? [centroidLon, centroidLat] : [0, 0];
      if (centroidLat) {
        allLatCoords.push(centroidLat);
      }
      if (centroidLon) {
        allLngCoords.push(centroidLon);
      }
      const targetCountry = responseData.countries.find(country => countryId !== null && country.countryId === countryId.toString());
      if (targetCountry && !countries.find(country => countryId !== null && country.value === countryId.toString())) {
        countries.push({
          label: targetCountry.nameShortEn ? targetCountry.nameShortEn : '',
          value: targetCountry.countryId,
          regionId: targetCountry.regionId !== null ? targetCountry.regionId.toString() : '',
        });
      }
      return point(coordinates, {
        id: cityId,
        country: targetCountry ? targetCountry.nameShortEn : '',
        countryId: targetCountry ? targetCountry.countryId.toString() : '',
        city: name,
        fill: 'gray',
        radius: defaultRadius,
        population,
        gdppc,
        region: city.region,
      });
    }));

    const uMapXCoords: number[] = [];
    const uMapYCoords: number[] = [];
    filteredUMapCities.forEach(({x, y}) => {
      uMapXCoords.push(x);
      uMapYCoords.push(y);
    });

    const minMaxLat = extent(allLatCoords) as [number, number];
    const yToLatScale = scaleLinear()
      .domain(extent(uMapYCoords) as [number, number])
      .range([minMaxLat[0] * 1.65, minMaxLat[1] * 1.2]) as ((val: number) => number);

    const minMaxLng = extent(allLngCoords) as [number, number];
    const xToLngScale = scaleLinear()
      .domain(extent(uMapXCoords) as [number, number])
      .range([minMaxLng[0] * 0.9, minMaxLng[1] * 1]) as ((val: number) => number);

    const cityUMapJson = featureCollection(filteredUMapCities.map(n => {
      const {x, y, ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = n;
      const targetCity = filteredResponseCities.find(c => c.cityId.toString() === id.toString());
      return point([xToLngScale(x), yToLatScale(y)], {
        id: id.toString(),
        country, city, fill: 'gray', radius: defaultRadius,
        population: targetCity ? targetCity.population : 0,
        gdppc: targetCity ? targetCity.gdppc : 0,
        region: targetCity ? targetCity.region : null,
      });
    }));

    data = {cityGeoJson, cityUMapJson, regions, countries: orderBy(countries, ['label'])};
  }


  return {loading, error, data};
};

export default useLayoutData;
