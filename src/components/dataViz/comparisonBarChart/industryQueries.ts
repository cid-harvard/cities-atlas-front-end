import { gql } from "@apollo/client";

export const ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData(
    $primaryCity: Int!
    $secondaryCity: Int!
    $year: Int!
  ) {
    primaryCityIndustries: cityIndustryYearList(
      cityId: $primaryCity
      year: $year
    ) {
      id
      industryId: naicsId
      numCompany
      numEmploy
    }
    secondaryCityIndustries: cityIndustryYearList(
      cityId: $secondaryCity
      year: $year
    ) {
      id
      industryId: naicsId
      numCompany
      numEmploy
    }
  }
`;

export const PEER_GROUP_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData(
    $primaryCity: Int!
    $peerGroup: String!
    $year: Int!
  ) {
    primaryCityIndustries: cityIndustryYearList(
      cityId: $primaryCity
      year: $year
    ) {
      id
      industryId: naicsId
      numCompany
      numEmploy
    }
    groupIndustries_1: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 1
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_2: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 2
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_3: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 3
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_4: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 4
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_5: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 5
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
    groupIndustries_6: naicsPeerEconStruct(
      cityId: $primaryCity
      year: $year
      peerGroup: $peerGroup
      naicsLevel: 6
    ) {
      id: naicsId
      industryId: naicsId
      numCompany: avgEmployCount
      numEmploy: avgCompanyCount
    }
  }
`;

export const WORLD_ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetWorldCityIndustryTreeData($primaryCity: Int!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(
      cityId: $primaryCity
      year: $year
    ) {
      id
      industryId: naicsId
      numCompany
      numEmploy
    }
    groupIndustries_1: globalIndustryYear(year: $year, level: 1) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_2: globalIndustryYear(year: $year, level: 2) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_3: globalIndustryYear(year: $year, level: 3) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_4: globalIndustryYear(year: $year, level: 4) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_5: globalIndustryYear(year: $year, level: 5) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
    groupIndustries_6: globalIndustryYear(year: $year, level: 6) {
      id: naicsId
      industryId: naicsId
      numCompany: avgNumCompany
      numEmploy: avgNumEmploy
    }
  }
`;
