import { useQuery, gql, DocumentNode } from '@apollo/client';
import {
  CityIndustryYear,
  GlobalIndustryYear,
} from '../../../types/graphQL/graphQLTypes';

export enum RegionGroup {
  World = 'world',
  SimilarCities = 'similarcities',
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

const WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetWorldCityIndustryTreeData($primaryCity: Int!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(cityId: $primaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
    worldIndustries_1: globalIndustryYear(year: $year, level: 1) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    worldIndustries_2: globalIndustryYear(year: $year, level: 2) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    worldIndustries_3: globalIndustryYear(year: $year, level: 3) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    worldIndustries_4: globalIndustryYear(year: $year, level: 4) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    worldIndustries_5: globalIndustryYear(year: $year, level: 5) {
      id: naicsId
      naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    worldIndustries_6: globalIndustryYear(year: $year, level: 6) {
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

interface WorldIndustryList {
  id: GlobalIndustryYear['naicsId'];
  naicsId: GlobalIndustryYear['naicsId'];
  numCompany: GlobalIndustryYear['avgNumCompany'];
  numEmploy: GlobalIndustryYear['avgNumEmploy'];
}

interface WorldSuccessResponse {
  primaryCityIndustries: IndustriesList[];
  worldIndustries_1: WorldIndustryList[];
  worldIndustries_2: WorldIndustryList[];
  worldIndustries_3: WorldIndustryList[];
  worldIndustries_4: WorldIndustryList[];
  worldIndustries_5: WorldIndustryList[];
  worldIndustries_6: WorldIndustryList[];

}

export const useEconomicCompositionComparisonQuery = (variables: CityVariables) =>
  useQuery<SuccessResponse, CityVariables>(ECONOMIC_COMPOSITION_COMPARISON_QUERY, { variables });

interface InputVariables {
  primaryCity: number;
  comparison: number | RegionGroup;
  year: number;
}

interface QueryVariables {
  primaryCity: number;
  secondaryCity?: number;
  year: number;
}

export const useComparisonQuery = (input: InputVariables) => {
  let QUERY: DocumentNode;
  const variables: QueryVariables = {primaryCity: input.primaryCity, year: input.year};
  if (input.comparison === RegionGroup.World || input.comparison === RegionGroup.SimilarCities) {
    QUERY = WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY;
  } else {
    variables.secondaryCity = input.comparison;
    QUERY = ECONOMIC_COMPOSITION_COMPARISON_QUERY;
  }
  const {loading, error, data: response} = useQuery<SuccessResponse>(QUERY, { variables });
  let data: SuccessResponse | undefined;
  if (input.comparison === RegionGroup.World || input.comparison === RegionGroup.SimilarCities) {
    data = response === undefined ? response : {
      primaryCityIndustries: response.primaryCityIndustries,
      secondaryCityIndustries: [],
    };
    if (data !== undefined && response !== undefined) {
      const {
        worldIndustries_1, worldIndustries_2, worldIndustries_3,
        worldIndustries_4, worldIndustries_5, worldIndustries_6,
      } = response as any as WorldSuccessResponse;
      data.secondaryCityIndustries.push(
        ...worldIndustries_1.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...worldIndustries_2.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...worldIndustries_3.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...worldIndustries_4.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...worldIndustries_5.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
      data.secondaryCityIndustries.push(
        ...worldIndustries_6.map(d => ({...d, id: `${d.id}`, naicsId: `${d.naicsId}` })),
      );
    }
  } else {
    data = response;
  }

  return {loading, error, data};
};

