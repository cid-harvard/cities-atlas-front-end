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
import PresenceToggle from '../legend/PresenceToggle';
import BenchmarkLegend from '../legend/BenchmarkLegend';

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
  padding-bottom: 90px;
`;

const BenchmarkLegendRoot = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
`;

const BenchmarkLegendContent = styled.div`
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.5rem;
`;

interface Props {
  digitLevel: DigitLevel;
  clusterLevel: ClusterLevel;
  compositionType: CompositionType;
  aggregationMode: AggregationMode;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  hiddenClusters: ClassificationNaicsCluster['id'][];
  highlighted: string | undefined;
  clearHighlighted: () => void;
}

const PSWOTTable = (props: Props) => {
  const {
    digitLevel, compositionType, aggregationMode, clusterLevel,
    hiddenSectors, hiddenClusters, highlighted, clearHighlighted,
  } = props;

  const table = aggregationMode === AggregationMode.cluster ? (
    <ClusterTable
      clusterLevel={clusterLevel}
      compositionType={compositionType}
      hiddenClusters={hiddenClusters}
      highlighted={highlighted}
      clearHighlighted={clearHighlighted}
    />
  ) : (
    <NAICSTable
      digitLevel={digitLevel}
      compositionType={compositionType}
      hiddenSectors={hiddenSectors}
      highlighted={highlighted}
      clearHighlighted={clearHighlighted}
    />
  );

  return (
    <Root>
      <ScrollRoot hideScrollbars={false}>
        {table}
      </ScrollRoot>
      <BenchmarkLegendRoot>
        <BenchmarkLegendContent>
          <PresenceToggle />
          <BenchmarkLegend />
        </BenchmarkLegendContent>
      </BenchmarkLegendRoot>
    </Root>
  );
};

export default PSWOTTable;
