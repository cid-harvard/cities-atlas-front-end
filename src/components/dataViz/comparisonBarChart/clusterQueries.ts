import { gql } from '@apollo/client';

export const CLUSTER_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData($primaryCity: Int!, $secondaryCity: Int!, $year: Int!) {

    primaryCityIndustries: cityClusterYearList(cityId: $primaryCity, year: $year) {
      id
      industryId: clusterId
      numCompany
      numEmploy
    }

    secondaryCityIndustries: cityClusterYearList(cityId: $secondaryCity, year: $year) {
      id
      industryId: clusterId
      numCompany
      numEmploy
    }
  }
`;

export const CLUSTER_PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData($primaryCity: Int!, $peerGroup: String!, $year: Int!) {
    primaryCityIndustries: cityClusterYearList(cityId: $primaryCity, year: $year) {
      id
      industryId: clusterId
      numCompany
      numEmploy
    }
    groupIndustries_1: clusterPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, clusterLevel: 1) {
      id: clusterId
      industryId: clusterId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_2: clusterPeerEconStruct(cityId: $primaryCity, year: $year, peerGroup: $peerGroup, clusterLevel: 3) {
      id: clusterId
      industryId: clusterId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
  }
`;

export const CLUSTER_WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetWorldCityIndustryTreeData($primaryCity: Int!, $year: Int!) {

    primaryCityIndustries: cityClusterYearList(cityId: $primaryCity, year: $year) {
      id
      industryId: clusterId
      numCompany
      numEmploy
    }
    groupIndustries_1: globalIndustryYear(year: $year, level: 1) {
      id: clusterId
      industryId: clusterId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_2: globalIndustryYear(year: $year, level: 3) {
      id: clusterId
      industryId: clusterId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
  }
`;
