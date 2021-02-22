import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  CityClusterYear,
  DigitLevel,
} from '../../../../types/graphQL/graphQLTypes';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const CLUSTER_INTENSITY_QUERY = gql`
  query GetClusterIntesityData($cityId: Int!, $year: Int!, $level: Int!) {
    clusterRca: cityClusterYearList(cityId: $cityId, year: $year) {
      clusterId
      level
      rcaNumCompany
      rcaNumEmploy
      id
    }
    nodeRca: cityIndustryYearList(cityId: $cityId, year: $year, level: $level) {
      naicsId
      numCompany
      numEmploy
      rcaNumCompany
      rcaNumEmploy
      id
    }
  }
`;

interface ClusterRca {
  clusterId: CityClusterYear['clusterId'];
  level: CityClusterYear['level'];
  rcaNumCompany: CityClusterYear['rcaNumCompany'];
  rcaNumEmploy: CityClusterYear['rcaNumEmploy'];
}

interface NodeRca {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
  rcaNumCompany: CityIndustryYear['rcaNumCompany'];
  rcaNumEmploy: CityClusterYear['rcaNumEmploy'];
}

export interface SuccessResponse {
  clusterRca: ClusterRca[];
  nodeRca: NodeRca[];
}

interface Variables {
  cityId: number | null;
  year: number;
  level: DigitLevel;
}

const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(CLUSTER_INTENSITY_QUERY, { variables });

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
