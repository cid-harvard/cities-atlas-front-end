import queryString from "query-string";
import { GlobalQueryParams } from "../routing/routes";
import { useHistory } from "react-router-dom";

export default () => {
  const history = useHistory();
  const params = queryString.parse(
    history.location.search,
  ) as unknown as GlobalQueryParams;
  return params;
};
