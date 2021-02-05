import {CompositionType} from '../types/graphQL/graphQLTypes';

// param must be specified in each route in order to enforce typechecking
export const cityIdParam = 'cityId';

export const CityRoutes = {
  CityBase: '/city/:cityId',
  CityEconomicComposition: '/city/:cityId/economic-composition',
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
  none = 'none',
  linear = 'linear',
  log = 'log',
}

export enum ColorBy {
  sector = 'sector',
  intensity = 'intensity',
}

export enum ClusterLevel {
  C1 = '1',
  C2 = '2',
  C3 = '3',
}

export const defaultClusterLevel: ClusterLevel = ClusterLevel.C2;

export interface GlobalQueryParams {
  compare_city: string | undefined;
  digit_level: string | undefined;
  composition_type: CompositionType | undefined;
  cluster_overlay: Toggle | undefined;
  node_sizing: NodeSizing | undefined;
  color_by: ColorBy | undefined;
  cluster_level: ClusterLevel | undefined;
}