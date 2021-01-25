import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  CityClusterYear,
} from '../../../../types/graphQL/graphQLTypes';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const CLUSTER_INTENSITY_QUERY = gql`
  query GetClusterIntesityData($cityId: Int!, $year: Int!) {
    clusterRca: cityClusterYearList(cityId: $cityId, year: $year) {
      clusterId
      level
      rcaNumCompany
      id
    }
    nodeRca: cityIndustryYearList(cityId: $cityId, year: $year, level: 6) {
      naicsId
      numCompany
      rcaNumCompany
      id
    }
  }
`;

interface ClusterRca {
  clusterId: CityClusterYear['clusterId'];
  level: CityClusterYear['level'];
  rcaNumCompany: CityClusterYear['rcaNumCompany'];
}

interface NodeRca {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  rcaNumCompany: CityIndustryYear['rcaNumCompany'];
}

export interface SuccessResponse {
  clusterRca: ClusterRca[];
  nodeRca: NodeRca[];
}

interface Variables {
  cityId: number | null;
  year: number;
}

const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(CLUSTER_INTENSITY_QUERY, { variables });

const useRCAData = () => {
  const cityId = useCurrentCityId();
  const {loading, error, data} = useClusterIntensityQuery({
    cityId: cityId !== null ? parseInt(cityId, 10) : null,
    year: defaultYear,
  });

  return cityId !== null ? {loading, error, data} : {loading: true, error: undefined, data: undefined};
};

export default useRCAData;
