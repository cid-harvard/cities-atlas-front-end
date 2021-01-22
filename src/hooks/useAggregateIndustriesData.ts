import { useQuery, gql } from '@apollo/client';
import {
  GlobalIndustryAgg,
  DigitLevel,
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
  }
`;

interface IndustryDatum {
  naicsId: GlobalIndustryAgg['naicsId'];
  sumNumCompany: GlobalIndustryAgg['sumNumCompany'];
  sumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
  avgNumCompany: GlobalIndustryAgg['avgNumCompany'];
  avgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
}

interface SuccessResponse {
  aggregateData: IndustryDatum[];
}

interface Variables {
  level: DigitLevel;
  year: number;
}

const useAggregateIndustriesData = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(GLOBAL_INDUSTRIES_QUERY, {variables});

interface IndustryMap {
  globalMinMax: {
    minSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    maxSumNumCompany: GlobalIndustryAgg['sumNumCompany'];
    minSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    maxSumNumEmploy: GlobalIndustryAgg['sumNumEmploy'];
    minAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    maxAvgNumCompany: GlobalIndustryAgg['avgNumCompany'];
    minAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
    maxAvgNumEmploy: GlobalIndustryAgg['avgNumEmploy'];
  };
  industries: {
    [id: string]: IndustryDatum;
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
    },
  };
  if (data !== undefined) {
    const {aggregateData} = data;
    aggregateData.forEach(d => response.industries[d.naicsId] = d);
    const [minSumNumCompany, maxSumNumCompany] = extent(aggregateData.map(d => d.sumNumCompany)) as [number, number];
    const [minSumNumEmploy, maxSumNumEmploy] = extent(aggregateData.map(d => d.sumNumEmploy)) as [number, number];
    const [minAvgNumCompany, maxAvgNumCompany] = extent(aggregateData.map(d => d.avgNumCompany)) as [number, number];
    const [minAvgNumEmploy, maxAvgNumEmploy] = extent(aggregateData.map(d => d.avgNumEmploy)) as [number, number];
    response.globalMinMax = {
      minSumNumCompany, maxSumNumCompany,
      minSumNumEmploy, maxSumNumEmploy,
      minAvgNumCompany, maxAvgNumCompany,
      minAvgNumEmploy, maxAvgNumEmploy,
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
