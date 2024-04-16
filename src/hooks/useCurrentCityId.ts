import { useHistory, matchPath } from "react-router-dom";
import { CityRoutes, cityIdParam } from "../routing/routes";
import { defaultCityPool } from "../Utils";
import random from "lodash-es/random";

let prevCity: string | null = null;

export default () => {
  const history = useHistory();
  const match = matchPath<{ [cityIdParam]: string }>(
    history.location.pathname,
    CityRoutes.CityBase,
  );
  let cityId =
    match && match.params[cityIdParam] ? match.params[cityIdParam] : prevCity;
  // If no cityId, default to a random selection of predefined cities
  if (!cityId || cityId === cityIdParam) {
    cityId = defaultCityPool[random(defaultCityPool.length - 1)].toString();
  }
  prevCity = cityId;
  return cityId;
};
