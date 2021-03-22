import useCurrentCityId from './useCurrentCityId';
import useGlobalLocationData from './useGlobalLocationData';

const useCurrentCity = () => {
  const cityId = useCurrentCityId();
  const {loading, data} = useGlobalLocationData();

  const city = cityId && data
    ? data.cities.find(c => c.cityId === cityId)
    : undefined;

  return {loading, city};
};

export default useCurrentCity;