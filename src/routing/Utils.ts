import {CityRoutes, cityIdParam} from './routes';

type ValueOfCityRoutes = typeof CityRoutes[keyof typeof CityRoutes];

export const createRoute = {
  city: (route: ValueOfCityRoutes, cityId: string) => route.replace(':' + cityIdParam, cityId),
};
