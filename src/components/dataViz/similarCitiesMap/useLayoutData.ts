import CITIES_UMAPJSON_RAW from './data/cities-umap.json';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import {colorByCountryColorMap} from './Utils';
import { useQuery, gql } from '@apollo/client';
import {point, featureCollection} from '@turf/helpers';
import {
  ClassificationCountry,
  ClassificationCity,
} from '../../../types/graphQL/graphQLTypes';

const GLOBAL_LOCATION_WITH_GEOMETRY_QUERY = gql`
  query GetGlobalLocationData {
    countries: classificationCountryList {
      countryId
      nameShortEn
      id
    }
    cities: classificationCityList {
      cityId
      name
      centroidLat
      centroidLon
      countryId
      id
    }
  }
`;

interface SuccessResponse {
  countries: {
    countryId: ClassificationCountry['countryId'],
    nameShortEn: ClassificationCountry['nameShortEn'],
    id: ClassificationCountry['id'],
  }[];
  cities: {
    cityId: ClassificationCity['cityId'],
    name: ClassificationCity['name'],
    centroidLat: ClassificationCity['centroidLat'],
    centroidLon: ClassificationCity['centroidLon'],
    countryId: ClassificationCity['countryId'],
    id: ClassificationCity['id'],
  }[];
}

interface Output {
  loading: boolean;
  error: any | undefined;
  data: {
    cityGeoJson: any;
    cityUMapJson: any;
  } | undefined;
}

const useLayoutData = (): Output => {
  const {loading, error, data: responseData} = useQuery<SuccessResponse, never>(GLOBAL_LOCATION_WITH_GEOMETRY_QUERY);

  let data: Output['data'] = undefined;
  if (responseData) {
    const allLatCoords: number[] = [];
    const allLngCoords: number[] = [];

    const filteredResponseCities = responseData.cities
      .filter(city => CITIES_UMAPJSON_RAW.find(umap => umap.ID_HDC_G0.toString() === city.cityId.toString()));

    const filteredUMapCities = CITIES_UMAPJSON_RAW
      .filter(umap => responseData.cities.find(city => umap.ID_HDC_G0.toString() === city.cityId.toString()));


    const cityGeoJson = featureCollection(filteredResponseCities.map(city => {
      const {name, centroidLat, centroidLon, cityId, countryId} = city;
      const coordinates: [number, number] = centroidLat && centroidLon ? [centroidLon, centroidLat] : [0, 0];
      if (centroidLat) {
        allLatCoords.push(centroidLat);
      }
      if (centroidLon) {
        allLngCoords.push(centroidLon);
      }
      const targetCountry = responseData.countries.find(country => countryId !== null && country.countryId === countryId.toString());
      return point(coordinates, {id: cityId, country: targetCountry ? targetCountry.nameShortEn : '', city: name, fill: '#fff'});
    }))

    const uMapXCoords: number[] = [];
    const uMapYCoords: number[] = [];
    filteredUMapCities.forEach(({x, y}) => {
      uMapXCoords.push(x);
      uMapYCoords.push(y);
    });

    const minMaxLat = extent(allLatCoords) as [number, number];
    const yToLatScale = scaleLinear()
      .domain(extent(uMapYCoords) as [number, number])
      .range([minMaxLat[0] * 1.65, minMaxLat[1] * 1.2]);

    const minMaxLng = extent(allLngCoords) as [number, number];
    const xToLngScale = scaleLinear()
      .domain(extent(uMapXCoords) as [number, number])
      .range([minMaxLng[0] * 0.9, minMaxLng[1] * 1]);

    const cityUMapJson = featureCollection(filteredUMapCities.map(n => {
      const {x, y, ID_HDC_G0: id, CTR_MN_NM: country, UC_NM_MN: city } = n;
      const colorNode = colorByCountryColorMap.find(c => c.id === country);
      const fill = colorNode ? colorNode.color : 'gray';
      return point([xToLngScale(x), yToLatScale(y)], {id, country, city, fill})
    }));

    data = {cityGeoJson, cityUMapJson}
  }


  return {loading, error, data};
}

export default useLayoutData;
