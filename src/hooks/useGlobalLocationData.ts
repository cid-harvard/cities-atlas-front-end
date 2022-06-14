import { useQuery, gql } from '@apollo/client';
import {
  ClassificationCountry,
  ClassificationRegion,
  ClassificationCity,
} from '../types/graphQL/graphQLTypes';
import {Datum as SearchDatum} from 'react-panel-search';
import {extent} from 'd3-array';
import {scaleLinear} from 'd3-scale';

const GLOBAL_LOCATION_QUERY = gql`
  query GetGlobalLocationData {
    countries: classificationCountryList {
      countryId
      code
      nameShortEn
      id
    }
    cities: classificationCityList {
      cityId
      name
      countryId
      id
      nameList
      centroidLat
      centroidLon
      population: populationLatest
      gdppc
      incomeClass
      region: regionId
      regionPopRank
      regionGdppcRank
      dataFlag
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
    code: ClassificationCountry['code'],
    nameShortEn: ClassificationCountry['nameShortEn'],
    id: ClassificationCountry['id'],
  }[];
  regions: {
    regionId: ClassificationRegion['regionId'],
    regionName: ClassificationRegion['regionName'],
  }[];
  cities: {
    cityId: ClassificationCity['cityId'],
    name: ClassificationCity['name'],
    nameList: ClassificationCity['nameList'],
    centroidLat: ClassificationCity['centroidLat'],
    centroidLon: ClassificationCity['centroidLon'],
    countryId: ClassificationCity['countryId'],
    geometry: ClassificationCity['geometry'],
    population: ClassificationCity['populationLatest'],
    gdppc: ClassificationCity['gdppc'],
    incomeClass: ClassificationCity['incomeClass'],
    id: ClassificationCity['id'],
    region: ClassificationCity['regionId'],
    regionPopRank: ClassificationCity['regionPopRank'],
    regionGdppcRank: ClassificationCity['regionGdppcRank'],
    dataFlag: ClassificationCity['dataFlag'],
  }[];
}

const useGlobalLocationData = () => useQuery<SuccessResponse, never>(GLOBAL_LOCATION_QUERY);

const getCountryStringId = (id: number | string | null) => `country-${id}`;

export const locationDataToHierarchicalTreeData = (data: SuccessResponse | undefined) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const {cities, countries} = data;
    response.push(
      ...countries
        .filter(({countryId}) => cities.find(c => c.countryId && c.countryId.toString() === countryId))
        .map(({nameShortEn, countryId}) => ({
        id: getCountryStringId(countryId),
        title: nameShortEn !== null ? nameShortEn : 'Unrecognized Country ' + countryId,
        parent_id: null,
        level: '0',
      })),
      ...cities.map(({cityId: id, name, countryId, nameList}) => {
        const parentCountry = countries.find(c => countryId && c.countryId.toString() === countryId.toString());
        const countryName = parentCountry && parentCountry.nameShortEn ? ', ' + parentCountry.nameShortEn : '';
        return {
          id,
          title: name !== null ? name + countryName : 'Unrecognized City ' + id + countryName,
          parent_id: getCountryStringId(countryId),
          level: '1',
          keywords: nameList ? nameList : undefined,
        };
      }),
    );
  }
  return response;
};

export const getPopulationScale = (data: SuccessResponse, min: number, max: number) => {
  const allPops: number[] = [];
  data.cities.forEach(c => c.population ? allPops.push(c.population) : null);
  return scaleLinear()
    .domain(extent(allPops) as [number, number])
    .range([min, max]);
};

export const getGdpPppScale = (data: SuccessResponse, min: number, max: number) => {
  const allGdp: number[] = [];
  data.cities.forEach(c => c.gdppc ? allGdp.push(c.gdppc) : null);
  return scaleLinear()
    .domain(extent(allGdp) as [number, number])
    .range([min, max]);
};

export const useGlobalLocationHierarchicalTreeData = () => {
  const {loading, error, data: responseData} = useGlobalLocationData();
  const data = locationDataToHierarchicalTreeData(responseData);
  return {loading, error, data};
};

export default useGlobalLocationData;

