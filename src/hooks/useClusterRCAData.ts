import { useQuery, gql } from '@apollo/client';
import {
  ClusterDensityRescale,
  ClusterLevel,
  ClusterRcaCalculation,
  PeerGroup,
  CompositionType,
  defaultCompositionType,
  isValidPeerGroup,
  CityClusterYear,
} from '../types/graphQL/graphQLTypes';
import useCurrentCityId from './useCurrentCityId';
import {defaultYear} from '../Utils';
import useQueryParams from './useQueryParams';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const CLUSTER_RCA_QUERY = gql`
  query GetClusterNodeIntesityData(
    $cityId: Int!,
    $year: Int!,
    $level: Int!,
    $peerGroup: String,
    $partnerCityIds: [Int],
    $variable: String,
  ) {
    clusterDensity: clusterDensityRescale(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      clusterLevel: $level
    ) {
      clusterId
      densityCompany
      densityEmploy
    }
    clusterRca(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      clusterLevel: $level,
      variable: $variable,
    ) {
      clusterId
      rca
    }
    clusterData: cityClusterYearList(cityId: $cityId, year: $year) {
      clusterId
      level
      numCompany
      numEmploy
      id
    }
  }
`;

interface ClusterDensity {
  clusterId: ClusterDensityRescale['clusterId'];
  densityCompany: ClusterDensityRescale['densityCompany'];
  densityEmploy: ClusterDensityRescale['densityEmploy'];
}

interface ClusterRca {
  clusterId: ClusterRcaCalculation['clusterId'];
  rca: ClusterRcaCalculation['rca'];
}

interface ClusterData {
  clusterId: CityClusterYear['clusterId'];
  level: CityClusterYear['level'];
  numCompany: CityClusterYear['numCompany'];
  numEmploy: CityClusterYear['numEmploy'];
}

export interface SuccessResponse {
  clusterDensity: ClusterDensity[];
  clusterRca: ClusterRca[];
  clusterData: ClusterData[];
}

interface Variables {
  cityId: number | null;
  year: number;
  level: ClusterLevel;
  peerGroup: PeerGroup | '';
  partnerCityIds: [number] | [];
  variable: 'employ' | 'company';
}

const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(CLUSTER_RCA_QUERY, { variables });

const useClusterRCAData = (level: ClusterLevel) => {
  const cityId = useCurrentCityId();

  const { benchmark, composition_type } = useQueryParams();


  const defaultCompositionVariable = defaultCompositionType === CompositionType.Companies ? 'company' : 'employ';
  let variable: 'employ' | 'company' = defaultCompositionVariable;
  if (composition_type === CompositionType.Companies) {
    variable = 'company';
  } else if (composition_type === CompositionType.Employees) {
    variable = 'employ';
  }

  const peerGroup = isValidPeerGroup(benchmark) ? benchmark as PeerGroup : '';

  const partnerCityIds: [number] | [] = benchmark !== undefined && !isNaN(parseInt(benchmark, 10))
    ? [parseInt(benchmark, 10)] : [];

  const {loading, error, data} = useClusterIntensityQuery({
    cityId: cityId !== null ? parseInt(cityId, 10) : null,
    year: defaultYear,
    level,
    peerGroup,
    partnerCityIds,
    variable,
  });

  return cityId !== null ? {loading, error, data} : {loading: true, error: undefined, data: undefined};
};

export default useClusterRCAData;
