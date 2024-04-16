import useQueryParams from "./useQueryParams";
import useGlobalLocationData from "./useGlobalLocationData";
import { PeerGroup, isValidPeerGroup } from "../types/graphQL/graphQLTypes";
import useFluent from "../hooks/useFluent";
import { defaultBenchmark } from "../components/navigation/secondaryHeader/comparisons/AddComparisonModal";
import { RegionGroup } from "../components/dataViz/comparisonBarChart/cityIndustryComparisonQuery";

const useCurrentBenchmark = () => {
  const params = useQueryParams();
  const benchmark = params.benchmark ? params.benchmark : defaultBenchmark;
  const getString = useFluent();
  const { data } = useGlobalLocationData();

  const selectedValue =
    data && data.cities
      ? data.cities.find(({ cityId }) => cityId === benchmark)
      : undefined;
  const country =
    selectedValue && data && data.cities
      ? data.countries.find(
          ({ countryId }) =>
            selectedValue.countryId &&
            countryId === selectedValue.countryId.toString(),
        )
      : undefined;
  let benchmarkName = selectedValue
    ? selectedValue.name + (country ? ", " + country.nameShortEn : "")
    : "---";
  let benchmarkNameShort = selectedValue ? selectedValue.name : "---";
  if (isValidPeerGroup(benchmark) || benchmark === RegionGroup.World) {
    benchmarkName = getString("global-formatted-peer-groups", {
      type: benchmark,
    });
    benchmarkNameShort = getString("global-formatted-peer-groups-short", {
      type: benchmark,
    });
  }

  return {
    benchmarkName,
    benchmarkNameShort,
    benchmark: benchmark as string | PeerGroup,
  };
};

export default useCurrentBenchmark;
