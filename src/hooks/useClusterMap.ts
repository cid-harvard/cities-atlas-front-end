import useFluent from "./useFluent";
import { clusterColorMap } from "../styling/styleUtils";

export default () => {
  const getString = useFluent();
  return clusterColorMap.map(({ id, color }) => ({
    id,
    color,
    name: getString("global-cluster-c1-name-" + id),
  }));
};
