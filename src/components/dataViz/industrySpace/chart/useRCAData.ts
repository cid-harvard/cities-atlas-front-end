import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  CityClusterYear,
  DigitLevel,
  PeerGroup,
  CompositionType,
  defaultCompositionType,
  NaicsRcaCalculation,
  ClusterRcaCalculation,
  isValidPeerGroup,
} from '../../../../types/graphQL/graphQLTypes';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';
import useQueryParams from '../../../../hooks/useQueryParams';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const CLUSTER_INTENSITY_QUERY = gql`
  query GetClusterIntesityData(
    $cityId: Int!,
    $year: Int!,
    $level: Int!,
    $peerGroup: String,
    $partnerCityIds: [Int],
    $variable: String,
  ) {
    clusterData: cityClusterYearList(cityId: $cityId, year: $year) {
      clusterId
      level
      numEmploy
      id
    }
    naicsData: cityIndustryYearList(cityId: $cityId, year: $year, level: $level) {
      naicsId
      numCompany
      numEmploy
      id
    }
    naicsRca(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      naicsLevel: $level,
      variable: $variable,
    ) {
      naicsId
      rca
    }
    c1Rca: clusterRca(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      clusterLevel: 1,
      variable: $variable,
    ) {
      clusterId
      rca
    }
    c3Rca: clusterRca(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      clusterLevel: 3,
      variable: $variable,
    ) {
      clusterId
      rca
    }
  }
`;

interface ClusterData {
  clusterId: CityClusterYear['clusterId'];
  level: CityClusterYear['level'];
  numEmploy: CityClusterYear['numEmploy'];
}

interface NaicsData {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
}

interface NaicsRca {
  naicsId: NaicsRcaCalculation['naicsId'];
  rca: NaicsRcaCalculation['rca'];
}

interface ClusterRca {
  clusterId: ClusterRcaCalculation['clusterId'];
  rca: ClusterRcaCalculation['rca'];
}

export interface SuccessResponse {
  clusterData: ClusterData[];
  naicsData: NaicsData[];
  naicsRca: NaicsRca[];
  c1Rca: ClusterRca[];
  c3Rca: ClusterRca[];
}

interface Variables {
  cityId: number | null;
  year: number;
  level: DigitLevel;
  peerGroup: PeerGroup | '';
  partnerCityIds: [number] | [];
  variable: 'employ' | 'company';
}

export const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(CLUSTER_INTENSITY_QUERY, { variables });

const useRCAData = (level: DigitLevel) => {
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

export default useRCAData;
