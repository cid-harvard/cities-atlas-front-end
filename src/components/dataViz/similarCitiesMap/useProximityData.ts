import {
  CityPartner,
  CityPartnerEucDistScale,
} from '../../../types/graphQL/graphQLTypes';
import { useQuery, gql } from '@apollo/client';
import useCurrentCityId from '../../../hooks/useCurrentCityId';

const GET_SIMILAR_CITIES_PROXIMITY_QUERY = gql`
  query GetSimilarCities($cityId: Int) {
    cities: cityPartnerList (cityId: $cityId){
      cityId
      partnerId
      eucdist
      id
    }
    cityPartnerEucdistScale {
      minGlobalEucdist
      maxGlobalEucdist
    }
  }
`;

export interface SuccessResponse {
  cities: {
    cityId: CityPartner['cityId'];
    partnerId: CityPartner['partnerId'];
    eucdist: CityPartner['eucdist'];
    id: CityPartner['id'];
  }[];
  cityPartnerEucdistScale: CityPartnerEucDistScale;
}

const useProximityData = () => {
  const cityId = useCurrentCityId();

  const response = useQuery<SuccessResponse, {cityId: number | null}>(GET_SIMILAR_CITIES_PROXIMITY_QUERY, {
    variables: {cityId: cityId ? parseInt(cityId, 10) : null},
  });
  return response;
};

export default useProximityData;