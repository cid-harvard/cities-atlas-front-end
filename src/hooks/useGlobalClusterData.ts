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
      name: shortName
      tradable
      id
    }
  }
`;

interface Cluster {
  clusterId: ClassificationNaicsCluster['clusterId'];
  parentId: ClassificationNaicsCluster['parentId'];
  clusterIdTopParent: ClassificationNaicsCluster['clusterIdTopParent'];
  level: ClassificationNaicsCluster['level'];
  name: ClassificationNaicsCluster['name'];
  tradable: ClassificationNaicsCluster['tradable'];
  id: ClassificationNaicsCluster['id'];
}

interface SuccessResponse {
  clusters: Cluster[];
}

const useGlobalClusterData = () => useQuery<SuccessResponse, never>(GLOBAL_CLUSTER_QUERY);

const clusterDataToHierarchicalTreeData = (data: SuccessResponse | undefined) => {
  const response: SearchDatum[] = [];
  if (data !== undefined) {
    const {clusters} = data;
    clusters.forEach(({clusterId, name, level, clusterIdTopParent}) => {
      if (name !== null && level !== null && level !== 2) {
        response.push({
          id: clusterId,
          title: name,
          level,
          parent_id: clusterIdTopParent === null || clusterId === clusterIdTopParent.toString()
            ? null : clusterIdTopParent.toString(),
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
  [id: string]: Cluster;
}

const clusterDataToMap = (data: SuccessResponse | undefined) => {
  const response: ClusterMap = {};
  if (data !== undefined) {
    const {clusters} = data;
    clusters.forEach(({id, clusterId, name, level, parentId, clusterIdTopParent, tradable}) => {
      response[clusterId] = {
        id,
        clusterId,
        name,
        level,
        parentId,
        tradable,
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

