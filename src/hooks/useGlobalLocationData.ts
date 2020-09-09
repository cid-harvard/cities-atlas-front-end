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
      nameList
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
    nameList: ClassificationCity['nameList'],
    centroidLat: ClassificationCity['centroidLat'],
    centroidLon: ClassificationCity['centroidLon'],
    countryId: ClassificationCity['countryId'],
    id: ClassificationCity['id'],
  }[];
}

const useGlobalLocationData = () => useQuery<SuccessResponse, never>(GLOBAL_LOCATION_QUERY);

const getCountryStringId = (id: number | string | null) => `country-${id}`;

export const useGlobalLocationHierarchicalTreeData = () => {
  const {loading, error, data: responseData} = useGlobalLocationData();
  const data: SearchDatum[] = [];
  if (responseData !== undefined) {
    const {cities, countries} = responseData;
    data.push(
      ...countries.map(({nameShortEn, countryId}) => ({
        id: getCountryStringId(countryId),
        title: nameShortEn !== null ?nameShortEn : 'Unrecognized Country ' + countryId,
        parent_id: null,
        level: '0',
      })),
      ...cities.map(({cityId: id, name, countryId}) => ({
        id,
        title: name !== null ? name : 'Unrecognized City ' + id,
        parent_id: getCountryStringId(countryId),
        level: '1',
      })),
    );
  }
  return {loading, error, data};
};

export default useGlobalLocationData;

