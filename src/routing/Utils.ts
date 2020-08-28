import {ValueOfCityRoutes, cityIdParam} from './routes';

export const createRoute = {
  city: (route: ValueOfCityRoutes, cityId: string) => route.replace(':' + cityIdParam, cityId),
};
