import { useQuery, gql } from '@apollo/client';
import {
  NaicsDensityRescale,
  DigitLevel,
  NaicsRcaCalculation,
  PeerGroup,
  CompositionType,
  defaultCompositionType,
  isValidPeerGroup,
  CityIndustryYear,
} from '../types/graphQL/graphQLTypes';
import useCurrentCityId from './useCurrentCityId';
import {defaultYear} from '../Utils';
import useQueryParams from './useQueryParams';
import useCurrentBenchmark from './useCurrentBenchmark';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
}

const NODE_RCA_QUERY = gql`
  query GetClusterIntesityData(
    $cityId: Int!,
    $year: Int!,
    $level: Int!,
    $peerGroup: String,
    $partnerCityIds: [Int],
    $variable: String,
  ) {
    naicsDensity: naicsDensityRescale(
      cityId: $cityId,
      peerGroup: $peerGroup,
      partnerCityIds: $partnerCityIds,
      year: $year,
      naicsLevel: $level
    ) {
      naicsId
      densityCompany
      densityEmploy
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
      comparableIndustry
    }
    naicsData: cityIndustryYearList(cityId: $cityId, year: $year, level: $level) {
      naicsId
      numCompany
      numEmploy
      id
    }
  }
`;

interface NaicsDensity {
  naicsId: NaicsDensityRescale['naicsId'];
  densityCompany: NaicsDensityRescale['densityCompany'];
  densityEmploy: NaicsDensityRescale['densityEmploy'];
}

interface NaicsData {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
}

interface NaicsRca {
  naicsId: NaicsRcaCalculation['naicsId'];
  comparableIndustry: NaicsRcaCalculation['comparableIndustry'];
  rca: NaicsRcaCalculation['rca'];
}

export interface SuccessResponse {
  naicsDensity: NaicsDensity[];
  naicsRca: NaicsRca[];
  naicsData: NaicsData[];
}

interface Variables {
  cityId: number | null;
  year: number;
  level: DigitLevel;
  peerGroup: PeerGroup | '';
  partnerCityIds: [number] | [];
  variable: 'employ' | 'company';
}

const useClusterIntensityQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(NODE_RCA_QUERY, { variables });

const useRCAData = (level: DigitLevel) => {
  const cityId = useCurrentCityId();

  const { composition_type } = useQueryParams();
  const { benchmark } = useCurrentBenchmark();


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
