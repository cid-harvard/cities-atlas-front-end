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
import SimpleTextLoading from '../../../../../../components/transitionStateComponents/SimpleTextLoading';
import styled from 'styled-components';
import { breakPoints } from '../../../../../../styling/GlobalGrid';

const Cell = styled.div`
  max-width: 380px;
  @media ${breakPoints.small} {
    max-width: 100%;
  }
`;

interface Props {
  cityId: string;
}

const TopRCA = ({ cityId }: Props) => {
  const getString = useFluent();
  const { loading, error, data } = useClusterIntensityQuery({
    cityId: cityId !== null ? parseInt(cityId, 10) : null,
    year: defaultYear,
    level: DigitLevel.Four,
    peerGroup: PeerGroup.GlobalPopulation,
    partnerCityIds: [],
    variable: 'employ',
  });
  const clusters = useGlobalClusterData();
  const industries = useGlobalIndustriesData();

  let topIndustriesElement: React.ReactElement<any> | null;
  let topClustersElement: React.ReactElement<any> | null;
  if (loading || clusters.loading || industries.loading) {
    topIndustriesElement = <SimpleTextLoading />;
    topClustersElement = <SimpleTextLoading />;
  } else if (error) {
    console.error(error);
    topIndustriesElement = null;
    topClustersElement = null;
  } else if (clusters.error) {
    console.error(clusters.error);
    topIndustriesElement = null;
    topClustersElement = null;
  } else if (industries.error) {
    console.error(industries.error);
    topIndustriesElement = null;
    topClustersElement = null;
  } else if (data && clusters.data && industries.data) {
    const {c3Rca, naicsRca} = data;

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
    topIndustriesElement = <>{topIndustries}</>;

    const clustersGreaterThan1 = c3Rca.filter(d => d.rca && d.rca >= 1);
    const topClusters = orderBy(clustersGreaterThan1 ? clustersGreaterThan1 : c3Rca, ['rca'], ['desc'])
      .slice(0, clustersGreaterThan1 ? 3 : 1)
      .map(d => {
        const cluster = clusters.data?.clusters.find(dd => dd.clusterId === d.clusterId + '');
        return (
          <ListItem key={d.clusterId}>
            {cluster?.name?.toUpperCase()}
          </ListItem>
        );
      });
    topClustersElement = <>{topClusters}</>;

  } else {
    topIndustriesElement = null;
    topClustersElement = null;
  }

  return (
    <>
      <Cell>
        <TitleBase>
          <Icon src={TopIndustriesSVG} />
          <WrappableText>
            {getString('city-overview-top-specialized-industries')}**
          </WrappableText>
          <YearText>
            {defaultYear}
            <Tooltip
              explanation={getString('city-overview-top-specialized-industries-tooltip')}
            />
          </YearText>
        </TitleBase>
        <ValueBase>
          {topIndustriesElement}
        </ValueBase>
      </Cell>
      <Cell>
        <TitleBase>
          <Icon src={TopClustersSVG} />
          <WrappableText>
            {getString('city-overview-top-knowledge-clusters')}**
          </WrappableText>
          <YearText>
            {defaultYear}
            <Tooltip
              explanation={getString('city-overview-top-knowledge-clusters-tooltip')}
            />
          </YearText>
        </TitleBase>
        <ValueBase>
          {topClustersElement}
        </ValueBase>
      </Cell>
    </>
  );
};

export default TopRCA;

