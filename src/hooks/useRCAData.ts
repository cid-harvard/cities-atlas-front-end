import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
} from '../types/graphQL/graphQLTypes';
import useCurrentCityId from './useCurrentCityId';
import {defaultYear} from '../Utils';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const NODE_RCA_QUERY = gql`
  query GetClusterIntesityData($cityId: Int!, $year: Int!, $level: Int!) {
    nodeRca: cityIndustryYearList(cityId: $cityId, year: $year, level: $level) {
      naicsId
      numCompany
      rcaNumCompany
      densityCompany
      numEmploy
      rcaNumEmploy
      densityEmploy
      id
    }
  }
`;

interface NodeRca {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  rcaNumCompany: CityIndustryYear['rcaNumCompany'];
  densityCompany: CityIndustryYear['densityCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
  rcaNumEmploy: CityIndustryYear['rcaNumEmploy'];
  densityEmploy: CityIndustryYear['densityEmploy'];
}

export interface SuccessResponse {
  nodeRca: NodeRca[];
}

interface Variables {
  cityId: number | null;
  year: number;
  level: number;
}

const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(NODE_RCA_QUERY, { variables });

const useRCAData = (level: DigitLevel) => {
  const cityId = useCurrentCityId();
  const {loading, error, data} = useClusterIntensityQuery({
    cityId: cityId !== null ? parseInt(cityId, 10) : null,
    year: defaultYear,
    level,
  });

  return cityId !== null ? {loading, error, data} : {loading: true, error: undefined, data: undefined};
};

export default useRCAData;
