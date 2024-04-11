import { CityRoutes, cityIdParam } from "./routes";

export type ValueOfCityRoutes = (typeof CityRoutes)[keyof typeof CityRoutes];

export const createRoute = {
  city: (route: ValueOfCityRoutes, cityId: string) =>
    route.replace(":" + cityIdParam, cityId),
};
