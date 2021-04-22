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
    maxYearsEducation: NaicsIndustry['yearsEducation'];
    minHourlyWage: NaicsIndustry['hourlyWage'];
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
    minHourlyWage: ClusterIndustry['hourlyWage'];
    maxHourlyWage: ClusterIndustry['hourlyWage'];
  };
  industries: {
    [id: string]: IndustryDatum & {
      yearsEducation: ClusterIndustry['yearsEducation'];
      hourlyWage: ClusterIndustry['hourlyWage'];
    };
  };
  clusters: {
    [id: string]: ClusterDatum & {
      yearsEducation: NaicsIndustry['yearsEducation'];
      hourlyWage: NaicsIndustry['hourlyWage'];
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
    },
  };
  if (data !== undefined) {
    const {aggregateData, averageData, clusterAverageData, aggregateClusterData} = data;
    const filteredAverageData = averageData.filter(d => d.level === level);
    aggregateData.forEach(d => {
      const averages = filteredAverageData.find(dd => {
        return dd.naicsId.toString() === d.naicsId.toString();
      });
      const yearsEducation = averages && averages.yearsEducation ? averages.yearsEducation : 0;
      const hourlyWage = averages && averages.hourlyWage ? averages.hourlyWage : 0;
      response.industries[d.naicsId] = {
        ...d,
        yearsEducation,
        hourlyWage,
      };
    });
    {
      const [minSumNumCompany, maxSumNumCompany] = extent(aggregateData.map(d => d.sumNumCompany)) as [number, number];
      const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateData.map(d => d.sumNumEmploy)) as [number, number];
      const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateData.map(d => d.avgNumCompany)) as [number, number];
      const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateData.map(d => d.avgNumEmploy)) as [number, number];
      const [minYearsEducation, maxYearsEducation] = extent(filteredAverageData.map(d => d.yearsEducation)) as [number, number];
      const [minHourlyWage, maxHourlyWage] = extent(filteredAverageData.map(d => d.hourlyWage)) as [number, number];
      response.globalMinMax = {
        minSumNumCompany, maxSumNumCompany,
        minSumNumEmploy, maxSumNumEmploy,
        minAvgNumCompany, maxAvgNumCompany,
        minAvgNumEmploy, maxAvgNumEmploy,
        minYearsEducation, maxYearsEducation,
        minHourlyWage, maxHourlyWage,
      };
    }

    const filteredAverageClusterData = clusterAverageData.filter(d => d.level === clusterLevel);
    aggregateClusterData.forEach(d => {
      const averages = filteredAverageClusterData.find(dd => {
        return dd.clusterId.toString() === d.clusterId.toString();
      });
      const yearsEducation = averages && averages.yearsEducation ? averages.yearsEducation : 0;
      const hourlyWage = averages && averages.hourlyWage ? averages.hourlyWage : 0;
      response.clusters[d.clusterId] = {
        ...d,
        yearsEducation,
        hourlyWage,
      };
    });

    {
      const [minSumNumCompany, maxSumNumCompany] = extent(aggregateClusterData.map(d => d.sumNumCompany)) as [number, number];
      const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateClusterData.map(d => d.sumNumEmploy)) as [number, number];
      const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateClusterData.map(d => d.avgNumCompany)) as [number, number];
      const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateClusterData.map(d => d.avgNumEmploy)) as [number, number];
      const [minYearsEducation, maxYearsEducation] = extent(filteredAverageClusterData.map(d => d.yearsEducation)) as [number, number];
      const [minHourlyWage, maxHourlyWage] = extent(filteredAverageClusterData.map(d => d.hourlyWage)) as [number, number];
      response.clusterMinMax = {
        minSumNumCompany, maxSumNumCompany,
        minSumNumEmploy, maxSumNumEmploy,
        minAvgNumCompany, maxAvgNumCompany,
        minAvgNumEmploy, maxAvgNumEmploy,
        minYearsEducation, maxYearsEducation,
        minHourlyWage, maxHourlyWage,
      };
    }

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
