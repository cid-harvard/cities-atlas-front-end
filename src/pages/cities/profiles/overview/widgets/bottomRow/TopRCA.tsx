import React from 'react';
import { defaultYear } from '../../../../../../Utils';
import { DigitLevel, PeerGroup } from '../../../../../../types/graphQL/graphQLTypes';
import { useClusterIntensityQuery } from '../../../../../../components/dataViz/industrySpace/chart/useRCAData';
import orderBy from 'lodash/orderBy';
import useGlobalClusterData from '../../../../../../hooks/useGlobalClusterData';
import useGlobalIndustriesData from '../../../../../../hooks/useGlobalIndustriesData';
import useFluent from '../../../../../../hooks/useFluent';
import { Icon, ListItem, TitleBase, ValueBase, WrappableText, YearText } from '../styleUtils';
import Tooltip from '../../../../../../components/general/Tooltip';
import TopIndustriesSVG from '../../../../../../assets/icons/topindustries.svg';
import TopClustersSVG from '../../../../../../assets/icons/topknowledgecluster.svg';

interface Props {
  cityId: string;
}

const TopRCA = ({ cityId }: Props) => {
  const getString = useFluent();
  const { loading, error, data } = useClusterIntensityQuery({
    cityId: cityId !== null ? parseInt(cityId, 10) : null,
    year: defaultYear,
    level: DigitLevel.Sector,
    peerGroup: PeerGroup.GlobalPopulation,
    partnerCityIds: [],
    variable: 'employ',
  });
  const clusters = useGlobalClusterData();
  const industries = useGlobalIndustriesData();

  if (loading || clusters.loading || industries.loading) {
    return null;
  } else if (error) {
    console.error(error);
    return null;
  } else if (clusters.error) {
    console.error(clusters.error);
    return null;
  } else if (industries.error) {
    console.error(industries.error);
    return null;
  } else if (data && clusters.data && industries.data) {
    const {c1Rca, naicsRca} = data;

    const industriesGreaterThan1 = naicsRca.filter(d => d.rca && d.rca >= 1);
    const topIndustries = orderBy(industriesGreaterThan1 ? industriesGreaterThan1 : naicsRca, ['rca'], ['desc'])
      .slice(0, industriesGreaterThan1 ? 3 : 1)
      .map(d => {
        const industry = industries.data?.industries.find(dd => dd.naicsId === d.naicsId + '');
        return (
          <ListItem key={d.naicsId}>
            {industry?.name?.toUpperCase()}
          </ListItem>
        );
      });

    const clustersGreaterThan1 = c1Rca.filter(d => d.rca && d.rca >= 1);
    const topClusters = orderBy(clustersGreaterThan1 ? clustersGreaterThan1 : c1Rca, ['rca'], ['desc'])
      .slice(0, clustersGreaterThan1 ? 3 : 1)
      .map(d => {
        const cluster = clusters.data?.clusters.find(dd => dd.clusterId === d.clusterId + '');
        return (
          <ListItem key={d.clusterId}>
            {cluster?.name?.toUpperCase()}
          </ListItem>
        );
      });

    return (
      <>
        <div>
          <TitleBase>
            <Icon src={TopIndustriesSVG} />
            <WrappableText>
              {getString('city-overview-top-specialized-industries')}*
            </WrappableText>
            <YearText>
              {defaultYear}
              <Tooltip
                explanation={getString('city-overview-top-specialized-industries')}
              />
            </YearText>
          </TitleBase>
          <ValueBase>
            {topIndustries}
          </ValueBase>
        </div>
        <div>
          <TitleBase>
            <Icon src={TopClustersSVG} />
            <WrappableText>
              {getString('city-overview-top-knowledge-clusters')}*
            </WrappableText>
            <YearText>
              {defaultYear}
              <Tooltip
                explanation={getString('city-overview-top-knowledge-clusters')}
              />
            </YearText>
          </TitleBase>
          <ValueBase>
            {topClusters}
          </ValueBase>
        </div>
      </>
    );
  } else {
    return null;
  }
};

export default TopRCA;

