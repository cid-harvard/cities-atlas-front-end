import { useQuery, gql } from '@apollo/client';
import {
  ClassificationCountry,
  ClassificationCity,
} from '../types/graphQL/graphQLTypes';
import {Datum as SearchDatum} from 'react-panel-search';

const GLOBAL_LOCATION_QUERY = gql`
  query GetGlobalLocationData {
    countries: classificationCountryList {
      countryId
      nameShortEn
      id
    }
    cities: classificationCityList {
      cityId
      name
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
    geometry: ClassificationCity['geometry'],
    id: ClassificationCity['id'],
  }[];
}

const useGlobalLocationData = () => useQuery<SuccessResponse, never>(GLOBAL_LOCATION_QUERY);

const getCountryStringId = (id: number | string | null) => `country-${id}`;

export const locationDataToHierarchicalTreeData = (data: SuccessResponse | undefined) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const {cities, countries} = data;
    response.push(
      ...countries.map(({nameShortEn, countryId}) => ({
        id: getCountryStringId(countryId),
        title: nameShortEn !== null ?nameShortEn : 'Unrecognized Country ' + countryId,
        parent_id: null,
        level: '0',
      })),
      ...cities.map(({cityId: id, name, countryId}) => {
        const parentCountry = countries.find(c => countryId && c.countryId.toString() === countryId.toString());
        const countryName = parentCountry && parentCountry.nameShortEn ? ', ' + parentCountry.nameShortEn : '';
        return {
          id,
          title: name !== null ? name + countryName : 'Unrecognized City ' + id + countryName,
          parent_id: getCountryStringId(countryId),
          level: '1',
        };
      }),
    );
  }
  return response;
};

export const useGlobalLocationHierarchicalTreeData = () => {
  const {loading, error, data: responseData} = useGlobalLocationData();
  const data = locationDataToHierarchicalTreeData(responseData);
  return {loading, error, data};
};

export default useGlobalLocationData;

