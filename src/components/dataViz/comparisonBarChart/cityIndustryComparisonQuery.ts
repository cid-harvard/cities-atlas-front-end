import { useQuery, DocumentNode } from '@apollo/client';
import {
  CityIndustryYear,
  GlobalIndustryYear,
  isValidPeerGroup,
  PeerGroup,
} from '../../../types/graphQL/graphQLTypes';
import {
  ECONOMIC_COMPOSITION_COMPARISON_QUERY,
  PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY,
  WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY,
} from './industryQueries';
import {
  CLUSTER_ECONOMIC_COMPOSITION_COMPARISON_QUERY,
  CLUSTER_PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY,
  CLUSTER_WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY,
} from './clusterQueries';
import { AggregationMode } from '../../../routing/routes';

export enum RegionGroup {
  World = 'world',
}

interface IndustriesList {
  id: CityIndustryYear['id'];
  industryId: CityIndustryYear['naicsId'];
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
  industryId: GlobalIndustryYear['naicsId'];
  numCompany: GlobalIndustryYear['avgNumCompany'];
  numEmploy: GlobalIndustryYear['avgNumEmploy'];
}

interface GroupSuccessResponse {
  primaryCityIndustries: IndustriesList[];
  groupIndustries_1: GroupIndustryList[];
  groupIndustries_2: GroupIndustryList[];
  groupIndustries_3?: GroupIndustryList[];
  groupIndustries_4?: GroupIndustryList[];
  groupIndustries_5?: GroupIndustryList[];
  groupIndustries_6?: GroupIndustryList[];
}

export const useEconomicCompositionComparisonQuery = (variables: CityVariables) =>
  useQuery<SuccessResponse, CityVariables>(ECONOMIC_COMPOSITION_COMPARISON_QUERY, { variables });

interface InputVariables {
  primaryCity: number;
  comparison: number | RegionGroup | PeerGroup;
  year: number;
  aggregation: AggregationMode;
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
  if (input.aggregation === AggregationMode.cluster) {
    if (input.comparison === RegionGroup.World) {
      QUERY = CLUSTER_WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    } else if (isValidPeerGroup(input.comparison)) {
      variables.peerGroup = input.comparison as PeerGroup;
      QUERY = CLUSTER_PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    } else {
      variables.secondaryCity = input.comparison as number | undefined;
      QUERY = CLUSTER_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    }

  } else {
    if (input.comparison === RegionGroup.World) {
      QUERY = WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    } else if (isValidPeerGroup(input.comparison)) {
      variables.peerGroup = input.comparison as PeerGroup;
      QUERY = PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    } else {
      variables.secondaryCity = input.comparison as number | undefined;
      QUERY = ECONOMIC_COMPOSITION_COMPARISON_QUERY;
    }
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
      if (groupIndustries_1) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_1.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
      if (groupIndustries_2) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_2.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
      if (groupIndustries_3) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_3.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
      if (groupIndustries_4) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_4.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
      if (groupIndustries_5) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_5.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
      if (groupIndustries_6) {
        data.secondaryCityIndustries.push(
          ...groupIndustries_6.map(d => ({...d, id: `${d.id}`, industryId: `${d.industryId}` })),
        );
      }
    }
  } else {
    data = response;
  }

  return {loading, error, data};
};

