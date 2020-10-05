import { useQuery, gql } from '@apollo/client';
import {
  ClassificationNaicsIndustry,
} from '../types/graphQL/graphQLTypes';
import {Datum as SearchDatum} from 'react-panel-search';

const GLOBAL_INDUSTRIES_QUERY = gql`
  query GetGlobalIndustryData {
    industries: classificationNaicsIndustryList {
      naicsId
      name
      level
      parentId
      id
    }
  }
`;

interface IndustryDatum {
  id: ClassificationNaicsIndustry['id'];
  naicsId: ClassificationNaicsIndustry['naicsId'];
  name: ClassificationNaicsIndustry['name'];
  level: ClassificationNaicsIndustry['level'];
  parentId: ClassificationNaicsIndustry['parentId'];
}

interface SuccessResponse {
  industries: IndustryDatum[];
}

const useGlobalIndustriesData = () => useQuery<SuccessResponse, never>(GLOBAL_INDUSTRIES_QUERY);

const industryDataToHierarchicalTreeData = (data: SuccessResponse | undefined) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const {industries} = data;
    industries.forEach(({naicsId, name, level, parentId}) => {
      if (name !== null && level !== null) {
        response.push({
          id: naicsId,
          title: name,
          level,
          parent_id: parentId,
        });
      }
    });
  }
  return response;
};

export const useGlobalIndustryHierarchicalTreeData = () => {
  const {loading, error, data: responseData} = useGlobalIndustriesData();
  const data = industryDataToHierarchicalTreeData(responseData);
  return {loading, error, data};
};

interface IndustryDatumWithSector extends IndustryDatum {
  topLevelParentId: string;
}

interface IndustryMap {
  [id: string]: IndustryDatumWithSector;
}

const getTopLevelParentId = (id: string, industries: SuccessResponse['industries']) => {
  let topLevelParentId: string = id;
  let current: IndustryDatum | undefined = industries.find(datum => datum.naicsId === id);
  while(current && current.parentId !== null) {
    // eslint-disable-next-line
    current = industries.find(datum => parseInt(datum.naicsId, 10) === (current as IndustryDatum).parentId);
    if (current && current.parentId !== null) {
      topLevelParentId = current.parentId.toString();
    } else if (current && current.naicsId !== null) {
      topLevelParentId = current.naicsId.toString();
    }
  }
  return topLevelParentId;
};

const industryDataToMap = (data: SuccessResponse | undefined) => {
  const response: IndustryMap = {};
  if (data !== undefined) {
    const {industries} = data;
    industries.forEach(({id, naicsId, name, level, parentId}) => {
      response[naicsId] = {
        id,
        naicsId,
        name,
        level,
        parentId,
        topLevelParentId: getTopLevelParentId(naicsId, industries),
      };
    });
  }
  return response;
};

export const useGlobalIndustryMap = () => {
  const {loading, error, data: responseData} = useGlobalIndustriesData();
  const data = industryDataToMap(responseData);
  return {loading, error, data};
};

export default useGlobalIndustriesData;

