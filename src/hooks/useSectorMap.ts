import useFluent from "./useFluent";
import { sectorColorMap } from "../styling/styleUtils";

export default () => {
  const getString = useFluent();
  return sectorColorMap.map(({ id, color }) => ({
    id,
    color,
    name: getString("global-naics-sector-name-" + id),
  }));
};
