import { useQuery, gql } from "@apollo/client";
import { ClassificationNaicsIndustry } from "../types/graphQL/graphQLTypes";
import { Datum as SearchDatum } from "react-panel-search";

const GLOBAL_INDUSTRIES_QUERY = gql`
  query GetGlobalIndustryData {
    industries: classificationNaicsIndustryList {
      naicsId
      code
      name
      level
      parentId
      naicsIdTopParent
      tradable
      id
    }
  }
`;

interface IndustryDatum {
  id: ClassificationNaicsIndustry["id"];
  naicsId: ClassificationNaicsIndustry["naicsId"];
  code: ClassificationNaicsIndustry["code"];
  name: ClassificationNaicsIndustry["name"];
  level: ClassificationNaicsIndustry["level"];
  parentId: ClassificationNaicsIndustry["parentId"];
  naicsIdTopParent: ClassificationNaicsIndustry["naicsIdTopParent"];
  tradable: ClassificationNaicsIndustry["tradable"];
}

interface SuccessResponse {
  industries: IndustryDatum[];
}

const useGlobalIndustriesData = () =>
  useQuery<SuccessResponse, never>(GLOBAL_INDUSTRIES_QUERY);

const industryDataToHierarchicalTreeData = (
  data: SuccessResponse | undefined,
) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const { industries } = data;
    industries.forEach(({ naicsId, name, level, parentId }) => {
      if (name !== null && level !== null) {
        response.push({
          id: naicsId,
          title: name,
          level,
          parent_id: parentId === null ? null : parentId.toString(),
        });
      }
    });
  }
  return response;
};

export const useGlobalIndustryHierarchicalTreeData = () => {
  const { loading, error, data: responseData } = useGlobalIndustriesData();
  const data = industryDataToHierarchicalTreeData(responseData);
  return { loading, error, data };
};

interface IndustryMap {
  [id: string]: IndustryDatum;
}

const industryDataToMap = (data: SuccessResponse | undefined) => {
  const response: IndustryMap = {};
  if (data !== undefined) {
    const { industries } = data;
    industries.forEach(
      ({
        id,
        naicsId,
        name,
        level,
        parentId,
        naicsIdTopParent,
        code,
        tradable,
      }) => {
        response[naicsId] = {
          id,
          naicsId,
          code,
          name,
          level,
          parentId,
          naicsIdTopParent,
          tradable,
        };
      },
    );
  }
  return response;
};

export const useGlobalIndustryMap = () => {
  const { loading, error, data: responseData } = useGlobalIndustriesData();
  const data = industryDataToMap(responseData);
  return { loading, error, data };
};

export default useGlobalIndustriesData;
