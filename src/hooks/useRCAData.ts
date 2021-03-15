import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
  NaicsRcaCalculation,
  PeerGroup,
  CompositionType,
  defaultCompositionType,
} from '../types/graphQL/graphQLTypes';
import useCurrentCityId from './useCurrentCityId';
import {defaultYear} from '../Utils';
import useQueryParams from './useQueryParams';

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
    naicsData: cityIndustryYearList(cityId: $cityId, year: $year, level: $level) {
      naicsId
      numCompany
      rcaNumCompany
      densityCompany
      numEmploy
      rcaNumEmploy
      densityEmploy
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
  }
`;

interface NaicsData {
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  densityCompany: CityIndustryYear['densityCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
  densityEmploy: CityIndustryYear['densityEmploy'];
}


interface NaicsRca {
  naicsId: NaicsRcaCalculation['naicsId'];
  rca: NaicsRcaCalculation['rca'];
}

export interface SuccessResponse {
  naicsData: NaicsData[];
  naicsRca: NaicsRca[];
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

  const { benchmark, composition_type } = useQueryParams();


  const defaultCompositionVariable = defaultCompositionType === CompositionType.Companies ? 'company' : 'employ';
  let variable: 'employ' | 'company' = defaultCompositionVariable;
  if (composition_type === CompositionType.Companies) {
    variable = 'company';
  } else if (composition_type === CompositionType.Employees) {
    variable = 'employ';
  }

  const peerGroup = benchmark === PeerGroup.GlobalIncome || benchmark === PeerGroup.GlobalPopulation ||
                    benchmark === PeerGroup.RegionalIncome || benchmark === PeerGroup.RegionalPopulation
                    ? benchmark : '';

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
