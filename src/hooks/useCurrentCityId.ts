import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import {CityRoutes, cityIdParam} from '../routing/routes';

export default () => {
  const history = useHistory();
  const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, CityRoutes.CityBase);
  const cityId = match && match.params[cityIdParam] ? match.params[cityIdParam] : null;
  return cityId;
};
