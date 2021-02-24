import { useQuery, gql } from '@apollo/client';
import {
  GlobalIndustryAgg,
  DigitLevel,
  Industry,
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
    averageData: industryList {
      naicsId
      yearsEducation
      hourlyWage
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
  naicsId: Industry['naicsId'];
  yearsEducation: Industry['yearsEducation'];
  hourlyWage: Industry['hourlyWage'];
}

interface SuccessResponse {
  aggregateData: IndustryDatum[];
  averageData: AverageDatum[];
}

interface Variables {
  level: DigitLevel;
  year: number;
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
    minYearsEducation: Industry['yearsEducation'];
    maxYearsEducation: Industry['yearsEducation'];
    minHourlyWage: Industry['hourlyWage'];
    maxHourlyWage: Industry['hourlyWage'];
  };
  industries: {
    [id: string]: IndustryDatum & {
      yearsEducation: Industry['yearsEducation'];
      hourlyWage: Industry['hourlyWage'];
    };
  };
}

const industryDataToMap = (data: SuccessResponse | undefined) => {
  const response: IndustryMap = {
    industries: {},
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
  };
  if (data !== undefined) {
    const {aggregateData, averageData} = data;
    aggregateData.forEach(d => {
      const averages = averageData.find(dd => {
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
    const [minSumNumCompany, maxSumNumCompany] = extent(aggregateData.map(d => d.sumNumCompany)) as [number, number];
    const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateData.map(d => d.sumNumEmploy)) as [number, number];
    const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateData.map(d => d.avgNumCompany)) as [number, number];
    const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateData.map(d => d.avgNumEmploy)) as [number, number];
    const [minYearsEducation, maxYearsEducation] = extent(averageData.map(d => d.yearsEducation)) as [number, number];
    const [minHourlyWage, maxHourlyWage] = extent(averageData.map(d => d.hourlyWage)) as [number, number];
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
  const {loading, error, data: responseData} = useAggregateIndustriesData(variables);
  const data = industryDataToMap(responseData);
  return {loading, error, data};
};

export default useAggregateIndustriesData;
