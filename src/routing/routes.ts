// param must be specified in each route in order to enforce typechecking
export const cityIdParam = 'cityId';

export const CityRoutes = {
  CityBase: '/city/:cityId',
  CityEconomicComposition: '/city/:cityId/economic-composition',
  CityOutsideSubsidaries: '/city/:cityId/outside-subsidaries',
  CityGoodAt: '/city/:cityId/good-at',
  CityCompareSelf: '/city/:cityId/compare-to',
  CityIndustryMove: '/city/:cityId/industry-move-to',
  CitySummary: '/city/:cityId/summary',
} as const;

export const Routes = {
  Landing: '/',
  ...CityRoutes,
} as const;

export enum ValuesBasedOn {
  NumberOfEmployees = 'employees',
  NumberOfCompanies = 'companies',
}

export interface GlobalQueryParams {
  compare_city: string | undefined;
  digit_level: string | undefined;
  values_based_on: ValuesBasedOn | undefined;
}