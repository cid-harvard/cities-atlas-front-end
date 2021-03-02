import {CompositionType} from '../types/graphQL/graphQLTypes';

// param must be specified in each route in order to enforce typechecking
export const cityIdParam = 'cityId';

export const CityRoutes = {
  CityBase: '/city/:cityId',
  CityEconomicComposition: '/city/:cityId/economic-composition',
  CityEconomicCompositionClusters: '/city/:cityId/economic-composition/clusters',
  CityEconomicCompositionIndustryCompare: '/city/:cityId/economic-composition/compare-industries',
  CitySimilarCities: '/city/:cityId/similar-cities',
  CityGoodAt: '/city/:cityId/good-at',
  CityGoodAtClusters: '/city/:cityId/good-at/clusters',
  CityIndustrySpacePosition: '/city/:cityId/industry-position',
  CityGrowthOpportunities: '/city/:cityId/growth-opportunities',
  CityGrowthOpportunitiesTable: '/city/:cityId/growth-opportunities/table',
} as const;

export const Routes = {
  Landing: '/',
  ...CityRoutes,
} as const;

export enum Toggle {
  On = 'on',
  Off = 'off',
}

export enum NodeSizing {
  uniform = 'uniform',
  companies = 'companies',
  employees = 'employees',
  education = 'education',
  wage = 'wage',
}

export const defaultNodeSizing: NodeSizing = NodeSizing.companies;

export enum ColorBy {
  sector = 'sector',
  intensity = 'intensity',
  education = 'education',
  wage = 'wage',
}

export enum CityNodeSizing {
  uniform = 'uniform',
  population = 'population',
  gdpPpp = 'gdpPpp',
}

export const defaultCityNodeSizing: CityNodeSizing = CityNodeSizing.population;

export enum CityColorBy {
  proximity = 'proximity',
}

export enum ClusterLevel {
  C1 = '1',
  C2 = '2',
  C3 = '3',
}

export const defaultClusterLevel: ClusterLevel = ClusterLevel.C3;
export const defaultColorBy: ColorBy = ColorBy.sector;

export interface GlobalQueryParams {
  compare_city: string | undefined;
  digit_level: string | undefined;
  composition_type: CompositionType | undefined;
  cluster_overlay: Toggle | undefined;
  node_sizing: NodeSizing | undefined;
  color_by: ColorBy | undefined;
  city_node_sizing: CityNodeSizing | undefined;
  city_color_by: CityColorBy | undefined;
  cluster_level: ClusterLevel | undefined;
}