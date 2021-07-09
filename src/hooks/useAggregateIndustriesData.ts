import { useQuery, gql } from '@apollo/client';
import {
  NaicsPeerEconStruct,
  ClusterPeerEconStruct,
  DigitLevel,
  NaicsIndustry,
  ClusterIndustry,
  ClusterLevel,
  GlobalIndustryAgg,
} from '../types/graphQL/graphQLTypes';
import {extent} from 'd3-array';
import {filterOutliers} from '../Utils';
import sortBy from 'lodash/sortBy';

const GLOBAL_INDUSTRIES_QUERY = gql`
  query GetAggregateIndustryData($level: Int!, $clusterLevel: Int!, $year: Int!, $cityId: Int!) {
    aggregateData: naicsPeerEconStruct(cityId: $cityId, year: $year, peerGroup: "global", naicsLevel: $level) {
      naicsId
      sumNumCompany: totalCompanyCount
      sumNumEmploy: totalEmployCount
      avgNumCompany: avgCompanyCount
      avgNumEmploy: avgEmployCount
    }
    aggregateClusterData: clusterPeerEconStruct(
      cityId: $cityId, year: $year, peerGroup: "global", clusterLevel: $clusterLevel
    ) {
      clusterId
      sumNumCompany: totalCompanyCount
      sumNumEmploy: totalEmployCount
      avgNumCompany: avgCompanyCount
      avgNumEmploy: avgEmployCount
    }
    averageData: naicsIndustryList {
      naicsId
      yearsEducation
      hourlyWage
      level
    }
    clusterAverageData: clusterIndustryList {
      clusterId
      yearsEducation
      hourlyWage
      level
    }
  }
`;

interface AggregateDatum {
  sumNumCompany: NaicsPeerEconStruct['totalCompanyCount'];
  sumNumEmploy: NaicsPeerEconStruct['totalEmployCount'];
  avgNumCompany: NaicsPeerEconStruct['avgEmployCount'];
  avgNumEmploy: NaicsPeerEconStruct['avgCompanyCount'];
}

interface IndustryDatum extends AggregateDatum{
  naicsId: NaicsPeerEconStruct['naicsId'];
}

interface ClusterDatum extends AggregateDatum{
  clusterId: ClusterPeerEconStruct['clusterId'];
}

interface AverageDatum {
  naicsId: NaicsIndustry['naicsId'];
  yearsEducation: NaicsIndustry['yearsEducation'];
  hourlyWage: NaicsIndustry['hourlyWage'];
  level: NaicsIndustry['level'];
}

interface ClusterAverageData {
  clusterId: ClusterIndustry['clusterId'];
  yearsEducation: ClusterIndustry['yearsEducation'];
  hourlyWage: ClusterIndustry['hourlyWage'];
  level: ClusterIndustry['level'];
}

interface SuccessResponse {
  aggregateData: IndustryDatum[];
  aggregateClusterData: ClusterDatum[];
  averageData: AverageDatum[];
  clusterAverageData: ClusterAverageData[];
}

interface CoreVariables {
  level: DigitLevel;
  year: number;
  clusterLevel?: ClusterLevel;
}

interface Variables extends CoreVariables {
  cityId: number;
  clusterLevel: ClusterLevel;
}

const useAggregateIndustriesData = (variables: CoreVariables) =>
  useQuery<SuccessResponse, Variables>(GLOBAL_INDUSTRIES_QUERY, {
    variables: {
      ...variables,
      // 1022 = Boston's city id. For global peerGroup, city id does not matter,
      // but it is still required for the query to be successful
      cityId: 1022,
      clusterLevel: variables.clusterLevel ? variables.clusterLevel : ClusterLevel.C1,
    },
  });

export interface IndustryMap {
  globalMinMax: {
    minSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    maxSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    minSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    maxSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    minAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    maxAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    minAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
    maxAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
    minYearsEducation: NaicsIndustry['yearsEducation'];
    medianYearsEducation: NaicsIndustry['yearsEducation'];
    maxYearsEducation: NaicsIndustry['yearsEducation'];
    minHourlyWage: NaicsIndustry['hourlyWage'];
    medianHourlyWage: NaicsIndustry['hourlyWage'];
    maxHourlyWage: NaicsIndustry['hourlyWage'];
  };
  clusterMinMax: {
    minSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    maxSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    minSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    maxSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    minAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    maxAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    minAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
    maxAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
    minYearsEducation: ClusterIndustry['yearsEducation'];
    maxYearsEducation: ClusterIndustry['yearsEducation'];
    medianYearsEducation: ClusterIndustry['yearsEducation'];
    minHourlyWage: ClusterIndustry['hourlyWage'];
    medianHourlyWage: ClusterIndustry['hourlyWage'];
    maxHourlyWage: ClusterIndustry['hourlyWage'];
  };
  industries: {
    [id: string]: IndustryDatum & {
      yearsEducation: ClusterIndustry['yearsEducation'];
      hourlyWage: ClusterIndustry['hourlyWage'];
      yearsEducationRank: number;
      hourlyWageRank: number;
    };
  };
  clusters: {
    [id: string]: ClusterDatum & {
      yearsEducation: NaicsIndustry['yearsEducation'];
      hourlyWage: NaicsIndustry['hourlyWage'];
      yearsEducationRank: number;
      hourlyWageRank: number;
    };
  };
}

const industryDataToMap = (data: SuccessResponse | undefined, level: DigitLevel, clusterLevel: ClusterLevel) => {
  const response: IndustryMap = {
    industries: {},
    clusters: {},
    globalMinMax: {
      minSumNumCompany: 0,
      maxSumNumCompany: 0,
      minSumNumEmploy: 0,
      maxSumNumEmploy: 0,
      minAvgNumCompany: 0,
      maxAvgNumCompany: 0,
      minAvgNumEmploy: 0,
      maxAvgNumEmploy: 0,
      minYearsEducation: 0,
      maxYearsEducation: 0,
      minHourlyWage: 0,
      maxHourlyWage: 0,
      medianHourlyWage: 0,
      medianYearsEducation: 0,
    },
    clusterMinMax: {
      minSumNumCompany: 0,
      maxSumNumCompany: 0,
      minSumNumEmploy: 0,
      maxSumNumEmploy: 0,
      minAvgNumCompany: 0,
      maxAvgNumCompany: 0,
      minAvgNumEmploy: 0,
      maxAvgNumEmploy: 0,
      minYearsEducation: 0,
      maxYearsEducation: 0,
      minHourlyWage: 0,
      maxHourlyWage: 0,
      medianHourlyWage: 0,
      medianYearsEducation: 0,
    },
  };
  if (data !== undefined) {
    const {aggregateData, averageData, clusterAverageData, aggregateClusterData} = data;
    const filteredAverageData = averageData.filter(d => d.level === level);
    {
      const [minSumNumCompany, maxSumNumCompany] = extent(aggregateData.map(d => d.sumNumCompany)) as [number, number];
      const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateData.map(d => d.sumNumEmploy)) as [number, number];
      const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateData.map(d => d.avgNumCompany)) as [number, number];
      const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateData.map(d => d.avgNumEmploy)) as [number, number];
      const yearsEducationNoOutliers = filterOutliers(filteredAverageData.map(d => d.yearsEducation));
      const medianYearsEducation =
        sortBy(filteredAverageData, ['yearsEducation'])[Math.round(filteredAverageData.length / 2)].yearsEducation;
      const [minYearsEducation, maxYearsEducation] = extent(yearsEducationNoOutliers) as [number, number];
      const hourlyWageNoOutliers = filterOutliers(filteredAverageData.map(d => d.hourlyWage));
      const [minHourlyWage, maxHourlyWage] = extent(hourlyWageNoOutliers) as [number, number];
      const medianHourlyWage =
        sortBy(filteredAverageData, ['hourlyWage'])[Math.round(filteredAverageData.length / 2)].hourlyWage;
      response.globalMinMax = {
        minSumNumCompany, maxSumNumCompany,
        minSumNumEmploy, maxSumNumEmploy,
        minAvgNumCompany, maxAvgNumCompany,
        minAvgNumEmploy, maxAvgNumEmploy,
        minYearsEducation, maxYearsEducation,
        minHourlyWage, maxHourlyWage,
        medianYearsEducation, medianHourlyWage,
      };
    }
    aggregateData.forEach(d => {
      const averages = filteredAverageData.find(dd => dd.naicsId.toString() === d.naicsId.toString());
      const yearsEducation = averages && averages.yearsEducation ? averages.yearsEducation : 0;
      const hourlyWage = averages && averages.hourlyWage ? averages.hourlyWage : 0;
      let yearsEducationRank = yearsEducation < response.globalMinMax.minYearsEducation
        ? response.globalMinMax.minYearsEducation : yearsEducation;
      if (yearsEducationRank > response.globalMinMax.maxYearsEducation) {
        yearsEducationRank = response.globalMinMax.maxYearsEducation;
      }
      let hourlyWageRank =  hourlyWage < response.globalMinMax.minHourlyWage
        ? response.globalMinMax.minHourlyWage : hourlyWage;
      if (hourlyWageRank > response.globalMinMax.maxHourlyWage) {
        hourlyWageRank = response.globalMinMax.maxHourlyWage;
      }

      response.industries[d.naicsId] = {
        ...d,
        yearsEducation,
        hourlyWage,
        yearsEducationRank,
        hourlyWageRank,
      };
    });

    const filteredAverageClusterData = clusterAverageData.filter(d => d.level === clusterLevel);
    {
      const [minSumNumCompany, maxSumNumCompany] = extent(aggregateClusterData.map(d => d.sumNumCompany)) as [number, number];
      const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateClusterData.map(d => d.sumNumEmploy)) as [number, number];
      const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateClusterData.map(d => d.avgNumCompany)) as [number, number];
      const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateClusterData.map(d => d.avgNumEmploy)) as [number, number];
      const yearsEducationNoOutliers = filterOutliers(filteredAverageClusterData.map(d => d.yearsEducation));
      const medianYearsEducation =
        sortBy(filteredAverageClusterData, ['yearsEducation'])[Math.round(filteredAverageClusterData.length / 2)].yearsEducation;
      const [minYearsEducation, maxYearsEducation] = extent(yearsEducationNoOutliers) as [number, number];
      const hourlyWageNoOutliers = filterOutliers(filteredAverageClusterData.map(d => d.hourlyWage));
      const [minHourlyWage, maxHourlyWage] = extent(hourlyWageNoOutliers) as [number, number];
      const medianHourlyWage =
        sortBy(filteredAverageClusterData, ['hourlyWage'])[Math.round(filteredAverageClusterData.length / 2)].hourlyWage;
      response.clusterMinMax = {
        minSumNumCompany, maxSumNumCompany,
        minSumNumEmploy, maxSumNumEmploy,
        minAvgNumCompany, maxAvgNumCompany,
        minAvgNumEmploy, maxAvgNumEmploy,
        minYearsEducation, maxYearsEducation,
        minHourlyWage, maxHourlyWage,
        medianYearsEducation, medianHourlyWage,
      };
    }
    aggregateClusterData.forEach(d => {
      const averages = filteredAverageClusterData.find(dd => dd.clusterId.toString() === d.clusterId.toString());
      const yearsEducation = averages && averages.yearsEducation ? averages.yearsEducation : 0;
      const hourlyWage = averages && averages.hourlyWage ? averages.hourlyWage : 0;
      let yearsEducationRank = yearsEducation < response.clusterMinMax.minYearsEducation
        ? response.clusterMinMax.minYearsEducation : yearsEducation;
      if (yearsEducationRank > response.clusterMinMax.maxYearsEducation) {
        yearsEducationRank = response.clusterMinMax.maxYearsEducation;
      }
      let hourlyWageRank =  hourlyWage < response.clusterMinMax.minHourlyWage
        ? response.clusterMinMax.minHourlyWage : hourlyWage;
      if (hourlyWageRank > response.clusterMinMax.maxHourlyWage) {
        hourlyWageRank = response.clusterMinMax.maxHourlyWage;
      }

      response.clusters[d.clusterId] = {
        ...d,
        yearsEducation,
        hourlyWage,
        yearsEducationRank,
        hourlyWageRank,
      };
    });

  }
  return response;
};

export const useAggregateIndustryMap = (variables: CoreVariables) => {
  const clusterLevel = variables.clusterLevel ? variables.clusterLevel : ClusterLevel.C1;
  const {loading, error, data: responseData} = useAggregateIndustriesData({
    level: variables.level,
    year: variables.year,
    clusterLevel,
  });
  const data = industryDataToMap(responseData, variables.level, clusterLevel);
  return {loading, error, data};
};

export default useAggregateIndustriesData;
