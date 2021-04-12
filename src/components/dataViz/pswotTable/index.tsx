import React from 'react';
import {
  ClusterLevel,
  DigitLevel,
  CompositionType,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
} from '../../../types/graphQL/graphQLTypes';
import ScrollContainer from 'react-indiana-drag-scroll';
import styled from 'styled-components/macro';
import NAICSTable from './NAICSTable';
import ClusterTable from './ClusterTable';
import {
  AggregationMode,
} from '../../../routing/routes';

const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const ScrollRoot = styled(ScrollContainer)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  cursor: move;
`;

interface Props {
  digitLevel: DigitLevel;
  clusterLevel: ClusterLevel;
  compositionType: CompositionType;
  aggregationMode: AggregationMode;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  hiddenClusters: ClassificationNaicsCluster['id'][];
}

const PSWOTTable = (props: Props) => {
  const {
    digitLevel, compositionType, aggregationMode, clusterLevel,
    hiddenSectors, hiddenClusters,
  } = props;

  const table = aggregationMode === AggregationMode.cluster ? (
    <ClusterTable
      clusterLevel={clusterLevel}
      compositionType={compositionType}
      hiddenClusters={hiddenClusters}
    />
  ) : (
    <NAICSTable
      digitLevel={digitLevel}
      compositionType={compositionType}
      hiddenSectors={hiddenSectors}
    />
  );

  return (
    <Root>
      <ScrollRoot hideScrollbars={false}>
        {table}
      </ScrollRoot>
    </Root>
  );
};

export default PSWOTTable;
