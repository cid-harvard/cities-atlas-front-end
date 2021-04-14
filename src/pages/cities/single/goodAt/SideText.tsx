import React from 'react';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCity from '../../../../hooks/useCurrentCity';
import StandardSideTextLoading from '../../../../components/transitionStateComponents/StandardSideTextLoading';
import {
  DigitLevel,
  CompositionType,
} from '../../../../types/graphQL/graphQLTypes';
import useCurrentBenchmark from '../../../../hooks/useCurrentBenchmark';
import {useGlobalIndustryMap} from '../../../../hooks/useGlobalIndustriesData';
import {useGlobalClusterMap} from '../../../../hooks/useGlobalClusterData';
import useRCAData from '../../../../components/dataViz/industrySpace/chart/useRCAData';
import orderBy from 'lodash/orderBy';

interface Props {
  year: number;
  cityId: number;
  compositionType: CompositionType;
  isCluster: boolean;
}

const SideText = ({compositionType, isCluster}: Props) => {
  const getString = useFluent();
  const {loading, city} = useCurrentCity();
  const { benchmark } = useCurrentBenchmark();
  const rca = useRCAData(DigitLevel.Three);
  const sectorRCA = useRCAData(DigitLevel.Sector);
  const industryMap = useGlobalIndustryMap();
  const clusterMap = useGlobalClusterMap();
  if (loading || rca.loading || sectorRCA.loading || industryMap.loading) {
    return <StandardSideTextLoading />;
  } else if (city && rca.data && sectorRCA.data && industryMap.data) {
    const cityName = city.name ? city.name : '';
    let topNodes: string[];
    let topLevelHighest: string;
    let bottomLevelHighest: string;

    if (isCluster) {
      const sortedClusterHighRca = orderBy(rca.data.c3Rca, ['rca'], ['desc']);
      const sortedClusterLowRca = orderBy(sectorRCA.data.c1Rca, ['rca'], ['desc']);
      topNodes = sortedClusterHighRca.slice(0, 3).map(c => {
        const cluster = c.clusterId !== null ? clusterMap.data[c.clusterId.toString()] : undefined;
        return cluster && cluster.name ? cluster.name : '';
      });
      const top = sortedClusterLowRca[0];
      const bottom = sortedClusterLowRca[sortedClusterLowRca.length - 1];
      const topCluster = top.clusterId !== null ? clusterMap.data[top.clusterId.toString()] : undefined;
      topLevelHighest = topCluster && topCluster.name !== null ? topCluster.name : '';
      const bottomCluster = bottom.clusterId !== null ? clusterMap.data[bottom.clusterId.toString()] : undefined;
      bottomLevelHighest = bottomCluster && bottomCluster.name !== null ? bottomCluster.name : '';
    } else {
      const sortedNaicsRca = orderBy(rca.data.naicsRca, ['rca'], ['desc']);
      const sortedSectorRca = orderBy(sectorRCA.data.naicsRca, ['rca'], ['desc']);
      topNodes = sortedNaicsRca.slice(0, 3).map(c => {
        const industry = c.naicsId !== null ? industryMap.data[c.naicsId.toString()] : undefined;
        return industry && industry.name ? industry.name : '';
      });
      const top = sortedSectorRca[0];
      const bottom = sortedSectorRca[sortedSectorRca.length - 1];
      const topSector = top.naicsId !== null ? industryMap.data[top.naicsId.toString()] : undefined;
      topLevelHighest = topSector && topSector.name !== null ? topSector.name : '';
      const bottomSector = bottom.naicsId !== null ? industryMap.data[bottom.naicsId.toString()] : undefined;
      bottomLevelHighest = bottomSector && bottomSector.name !== null ? bottomSector.name : '';
    }

    const title = getString('good-at-title', {
      'name': cityName,
    });
    const para1 = getString('good-at-para-1', {
      'composition-type': compositionType,
      'benchmark-type': benchmark,
      'name': cityName,
      'node-1st': topNodes[0],
      'node-2nd': topNodes[1],
      'node-3rd': topNodes[2],
      'highest-top-level': topLevelHighest,
      'sector-or-cluster': isCluster ? 'cluster' : 'sector',
      'lowest-top-level': bottomLevelHighest,
    });

    return (
      <StandardSideTextBlock>
        <ContentTitle>{title}</ContentTitle>
        <ContentParagraph>{para1}</ContentParagraph>
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }

};

export default SideText;
