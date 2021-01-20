import {CompositionType} from '../types/graphQL/graphQLTypes';

// param must be specified in each route in order to enforce typechecking
export const cityIdParam = 'cityId';

export const CityRoutes = {
  CityBase: '/city/:cityId',
  CityEconomicComposition: '/city/:cityId/economic-composition',
  CityEconomicCompositionIndustryCompare: '/city/:cityId/economic-composition/compare-industries',
  CitySimilarCities: '/city/:cityId/similar-cities',
  CityGoodAt: '/city/:cityId/good-at',
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

export interface GlobalQueryParams {
  compare_city: string | undefined;
  digit_level: string | undefined;
  composition_type: CompositionType | undefined;
  hide_clusters: Toggle | undefined;
}