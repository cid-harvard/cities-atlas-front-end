import { useQuery, gql } from '@apollo/client';
import {
  GlobalIndustryAgg,
  DigitLevel,
  NaicsIndustry,
  ClusterIndustry,
  ClusterLevel,
} from '../types/graphQL/graphQLTypes';
import {extent} from 'd3-array';

const GLOBAL_INDUSTRIES_QUERY = gql`
  query GetAggregateIndustryData($level: Int!, $year: Int!) {
    aggregateData: globalIndustryYear(level: $level, year: $year) {
      naicsId
      sumNumCompany
      sumNumEmploy
      avgNumCompany
      avgNumEmploy
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

interface IndustryDatum {
  naicsId: GlobalIndustryAgg['naicsId'];
  sumNumCompany: GlobalIndustryAgg['sumNumCompany'];
  sumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
  avgNumCompany: GlobalIndustryAgg['avgNumCompany'];
  avgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
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
  averageData: AverageDatum[];
  clusterAverageData: ClusterAverageData[];
}

interface Variables {
  level: DigitLevel;
  year: number;
  clusterLevel?: ClusterLevel;
}

const useAggregateIndustriesData = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(GLOBAL_INDUSTRIES_QUERY, {variables});

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
    minYearsEducation: ClusterIndustry['yearsEducation'];
    maxYearsEducation: ClusterIndustry['yearsEducation'];
    minHourlyWage: ClusterIndustry['hourlyWage'];
    maxHourlyWage: ClusterIndustry['hourlyWage'];
  };
  industries: {
    [id: string]: IndustryDatum & {
      yearsEducation: NaicsIndustry['yearsEducation'];
      hourlyWage: NaicsIndustry['hourlyWage'];
    };
  };
  clusters: {
    [id: string]: ClusterAverageData;
  };
}

const industryDataToMap = (data: SuccessResponse | undefined, level: DigitLevel) => {
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
      minYearsEducation: 0,
      maxYearsEducation: 0,
      minHourlyWage: 0,
      maxHourlyWage: 0,
    },
  };
  if (data !== undefined) {
    const {aggregateData, averageData, clusterAverageData} = data;
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
    const allClusterWages: number[] = [];
    const allClusterEducations: number[] = [];
    clusterAverageData.forEach(c => {
      allClusterWages.push(c.hourlyWage);
      allClusterEducations.push(c.yearsEducation);
      response.clusters[c.clusterId] = c;
    });
    const [clusterMinYearsEducation, clusterMaxYearsEducation] = extent(allClusterEducations) as [number, number];
    const [clusterMinHourlyWage, clusterMaxHourlyWage] = extent(allClusterWages) as [number, number];
    response.clusterMinMax = {
      minYearsEducation: clusterMinYearsEducation,
      maxYearsEducation: clusterMaxYearsEducation,
      minHourlyWage: clusterMinHourlyWage,
      maxHourlyWage: clusterMaxHourlyWage,
    };

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
  return response;
};

export const useAggregateIndustryMap = (variables: Variables) => {
  const clusterLevel = variables.clusterLevel ? variables.clusterLevel : ClusterLevel.C1;
  const {loading, error, data: responseData} = useAggregateIndustriesData({
    level: variables.level,
    year: variables.year,
    clusterLevel,
  });
  const data = industryDataToMap(responseData, variables.level);
  return {loading, error, data};
};

export default useAggregateIndustriesData;
