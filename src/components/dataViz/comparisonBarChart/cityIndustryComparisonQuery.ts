import { useQuery, gql, DocumentNode } from '@apollo/client';
import {
  CityIndustryYear,
  GlobalIndustryYear,
  isValidPeerGroup,
  PeerGroup,
} from '../../../types/graphQL/graphQLTypes';

export enum RegionGroup {
  World = 'world',
}

const ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData($primaryCity: Int!, $secondaryCity: Int!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(cityId: $primaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
    secondaryCityIndustries: cityIndustryYearList(cityId: $secondaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
  }
`;

const PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData($primaryCity: Int!, $peerGroup: String!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(cityId: $primaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
    groupIndustries_1: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 1) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_2: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 2) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_3: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 3) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_4: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 4) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_5: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 5) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_6: naicsPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, naicsLevel: 6) {
      id: naicsId
      naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
  }
`;

const WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetWorldCityIndustryTreeData($primaryCity: Int!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(cityId: $primaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
    groupIndustries_1: globalIndustryYear(year: $year, level: 1) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_2: globalIndustryYear(year: $year, level: 2) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_3: globalIndustryYear(year: $year, level: 3) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_4: globalIndustryYear(year: $year, level: 4) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_5: globalIndustryYear(year: $year, level: 5) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_6: globalIndustryYear(year: $year, level: 6) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
  }
`;

interface IndustriesList {
  id: CityIndustryYear['id'];
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
}

export interface SuccessResponse {
  primaryCityIndustries: IndustriesList[];
  secondaryCityIndustries: IndustriesList[];
}

interface CityVariables {
  primaryCity: number;
  secondaryCity: number;
  year: number;
}

interface GroupIndustryList {
  id: GlobalIndustryYear['naicsId'];
  naicsId: GlobalIndustryYear['naicsId'];
  numCompany: GlobalIndustryYear['avgNumCompany'];
  numEmploy: GlobalIndustryYear['avgNumEmploy'];
}

interface GroupSuccessResponse {
  primaryCityIndustries: IndustriesList[];
  groupIndustries_1: GroupIndustryList[];
  groupIndustries_2: GroupIndustryList[];
  groupIndustries_3: GroupIndustryList[];
  groupIndustries_4: GroupIndustryList[];
  groupIndustries_5: GroupIndustryList[];
  groupIndustries_6: GroupIndustryList[];
}

export const useEconomicCompositionComparisonQuery = (variables: CityVariables) =>
  useQuery<SuccessResponse, CityVariables>(ECONOMIC_COMPOSITION_COMPARISON_QUERY, { variables });

interface InputVariables {
  primaryCity: number;
  comparison: number | RegionGroup | PeerGroup;
  year: number;
}

interface QueryVariables {
  primaryCity: number;
  secondaryCity?: number;
  peerGroup?: PeerGroup;
  year: number;
}

export const useComparisonQuery = (input: InputVariables) => {
  let QUERY: DocumentNode;
  const variables: QueryVariables = {primaryCity: input.primaryCity, year: input.year};
  if (input.comparison === RegionGroup.World) {
    QUERY = WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
  } else if (isValidPeerGroup(input.comparison)) {
    variables.peerGroup = input.comparison as PeerGroup;
    QUERY = PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
  } else {
    variables.secondaryCity = input.comparison as number | undefined;
    QUERY = ECONOMIC_COMPOSITION_COMPARISON_QUERY;
  }
  const {loading, error, data: response} = useQuery<SuccessResponse>(QUERY, { variables });
  let data: SuccessResponse | undefined;
  if (input.comparison === RegionGroup.World || isValidPeerGroup(input.comparison)) {
    data = response === undefined ? response : {
      primaryCityIndustries: response.primaryCityIndustries,
      secondaryCityIndustries: [],
    };
    if (data !== undefined && response !== undefined) {
      const {
        groupIndustries_1, groupIndustries_2, groupIndustries_3,
        groupIndustries_4, groupIndustries_5, groupIndustries_6,
      } = response as any as GroupSuccessResponse;
      data.secondaryCityIndustries.push(
        ...groupIndustries_1.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...groupIndustries_2.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...groupIndustries_3.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...groupIndustries_4.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...groupIndustries_5.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...groupIndustries_6.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
    }
  } else {
    data = response;
  }

  return {loading, error, data};
};

