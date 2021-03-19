import useQueryParams from './useQueryParams';
import useGlobalLocationData from './useGlobalLocationData';
import {PeerGroup} from '../types/graphQL/graphQLTypes';
import useFluent from '../hooks/useFluent';

const useCurrentBenchmark = () => {
  const {benchmark} = useQueryParams();
  const getString = useFluent();
  const {data} = useGlobalLocationData();

  const selectedValue = data && data.cities ? data.cities.find(({cityId}) => cityId === benchmark) : undefined;
  const country = selectedValue && data && data.cities
    ? data.countries.find(({countryId}) =>
      selectedValue.countryId && countryId === selectedValue.countryId.toString()) : undefined;
  let benchmarkName = selectedValue
    ? selectedValue.name + (country ? ', ' + country.nameShortEn : '')
    : '---';
  let benchmarkNameShort = selectedValue ? selectedValue.name : '---';
  if (benchmark === PeerGroup.GlobalIncome || benchmark === PeerGroup.GlobalPopulation ||
      benchmark === PeerGroup.RegionalIncome || benchmark === PeerGroup.RegionalPopulation) {
    benchmarkName = getString('global-formatted-peer-groups', {type: benchmark});
    benchmarkNameShort = getString('global-formatted-peer-groups-short', {type: benchmark});
  }

  return {
    benchmarkName,
    benchmarkNameShort,
    benchmark: benchmark as string | undefined | PeerGroup,
  };
};

export default useCurrentBenchmark;
