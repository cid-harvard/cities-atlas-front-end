import React from 'react';
import useGlobalClusterData from '../../../hooks/useGlobalClusterData';
import useClusterRCAData from '../../../hooks/useClusterRCAData';
import {
  ClusterLevel,
  CompositionType,
  defaultCompositionType,
  ClassificationNaicsCluster,
} from '../../../types/graphQL/graphQLTypes';
import Table, {getQuadrant} from './Table';
import {RowDatum} from './TableRow';
import {
  clusterColorMap,
} from '../../../styling/styleUtils';

interface Props {
  clusterLevel: ClusterLevel;
  compositionType: CompositionType;
  hiddenClusters: ClassificationNaicsCluster['id'][];
  highlighted: string | undefined;
  clearHighlighted: () => void;
}

const PSWOTTable = (props: Props) => {
  const {
    clusterLevel, compositionType, hiddenClusters, highlighted, clearHighlighted,
  } = props;
  const rcaData = useClusterRCAData(clusterLevel);
  const clusters = useGlobalClusterData();

  let error: any | undefined;
  if (clusters.error !== undefined) {
    error = clusters.error;
  }
  if (rcaData.error !== undefined) {
    error = rcaData.error;
  }

  let data: RowDatum[] | undefined;
  if (rcaData.data !== undefined && clusters && clusters.data) {
    const {clusterRca, clusterData} = rcaData.data;
    data = clusters.data.clusters
      .filter(d => d.level === clusterLevel &&
        !hiddenClusters.includes(d.clusterIdTopParent !== null ? d.clusterIdTopParent.toString() : ''))
      .map(d => {
        const rcaDatum = clusterRca.find(dd => dd.clusterId !== null && dd.clusterId.toString() === d.clusterId);
        const densityDatum = clusterData.find(dd => dd.clusterId !== null && dd.clusterId.toString() === d.clusterId);
        let densityKey: 'densityCompany' | 'densityEmploy';
        if (compositionType === CompositionType.Companies ||
            (!compositionType && defaultCompositionType === CompositionType.Companies)) {
          densityKey = 'densityCompany';
        } else {
          densityKey = 'densityEmploy';
        }
        const density = densityDatum && densityDatum[densityKey] !== null ? densityDatum[densityKey] as number : 0;
        const rca = rcaDatum && rcaDatum.rca ? rcaDatum.rca : 0;
        const quadrant = getQuadrant(rca, density);
        const parent = clusterColorMap.find(dd => d.clusterIdTopParent !== null &&
          d.clusterIdTopParent.toString() === dd.id);
        const datum: RowDatum = {
          id: d.clusterId,
          name: d.name ? d.name : '',
          density,
          rca,
          quadrant,
          color: parent ? parent.color : 'gray',
        };
        return datum;
      });
  }

  return (
    <Table
      loading={clusters.loading || rcaData.loading}
      error={error}
      data={data}
      compositionType={compositionType}
      highlighted={highlighted}
      clearHighlighted={clearHighlighted}
    />
  );
};

export default PSWOTTable;
