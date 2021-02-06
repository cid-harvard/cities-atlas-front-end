import { useQuery, gql } from '@apollo/client';
import {
  ClassificationNaicsCluster,
} from '../types/graphQL/graphQLTypes';
import {Datum as SearchDatum} from 'react-panel-search';

const GLOBAL_CLUSTER_QUERY = gql`
  query GetGlobalClusterData {
    clusters: classificationNaicsClusterList {
      clusterId
      parentId
      clusterIdTopParent
      level
      name
      id
    }
  }
`;

interface SuccessResponse {
  clusters: ClassificationNaicsCluster[];
}

const useGlobalClusterData = () => useQuery<SuccessResponse, never>(GLOBAL_CLUSTER_QUERY);

const clusterDataToHierarchicalTreeData = (data: SuccessResponse | undefined) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const {clusters} = data;
    clusters.forEach(({clusterId, name, level, parentId}) => {
      if (name !== null && level !== null) {
        response.push({
          id: clusterId,
          title: name,
          level,
          parent_id: parentId === null ? null : parentId.toString(),
        });
      }
    });
  }
  return response;
};

export const useGlobalClusterHierarchicalTreeData = () => {
  const {loading, error, data: responseData} = useGlobalClusterData();
  const data = clusterDataToHierarchicalTreeData(responseData);
  return {loading, error, data};
};

interface ClusterMap {
  [id: string]: ClassificationNaicsCluster;
}

const clusterDataToMap = (data: SuccessResponse | undefined) => {
  const response: ClusterMap = {};
  if (data !== undefined) {
    const {clusters} = data;
    clusters.forEach(({id, clusterId, name, level, parentId, clusterIdTopParent}) => {
      response[clusterId] = {
        id,
        clusterId,
        name,
        level,
        parentId,
        clusterIdTopParent,
      };
    });
  }
  return response;
};

export const useGlobalClusterMap = () => {
  const {loading, error, data: responseData} = useGlobalClusterData();
  const data = clusterDataToMap(responseData);
  return {loading, error, data};
};

export default useGlobalClusterData;

