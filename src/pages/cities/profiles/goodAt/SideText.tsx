import React from "react";
import StandardSideTextBlock from "../../../../components/general/StandardSideTextBlock";
import { ContentParagraph, ContentTitle } from "../../../../styling/styleUtils";
import useFluent, { possessive } from "../../../../hooks/useFluent";
import useCurrentCity from "../../../../hooks/useCurrentCity";
import StandardSideTextLoading from "../../../../components/transitionStateComponents/StandardSideTextLoading";
import useCurrentBenchmark from "../../../../hooks/useCurrentBenchmark";
import Helmet from "react-helmet";
import { isValidPeerGroup } from "../../../../types/graphQL/graphQLTypes";
import { RegionGroup } from "../../../../hooks/useClusterRCAData";

interface Props {
  isClusterView: boolean;
  prefix:
    | "relative-presence"
    | "absolute-presence"
    | "absolute-nested-bar-chart";
}

const SideText = (props: Props) => {
  const { isClusterView, prefix } = props;
  const getString = useFluent();
  const { loading, city } = useCurrentCity();
  const { benchmark, benchmarkNameShort } = useCurrentBenchmark();
  const benchmarkType =
    isValidPeerGroup(benchmark) || benchmark === RegionGroup.World
      ? benchmark
      : benchmarkNameShort;
  if (loading) {
    return <StandardSideTextLoading />;
  } else if (city) {
    const cityName = city.name ? city.name : "";
    const cityNamePossessive = possessive([cityName]);
    const its = getString("good-at-its", { "benchmark-type": benchmarkType });
    const the = getString("good-at-the", { "benchmark-type": benchmarkType });
    const peerGroupName = getString("good-at-benchmark", {
      "benchmark-type": benchmarkType,
    });
    const peerGroupPossessive = possessive([peerGroupName]);
    const industrialKnowledgeCluster = isClusterView
      ? "knowledge cluster"
      : "industrial";
    const industrysClusters = isClusterView ? "clusters" : "industries";
    const industryCluster = isClusterView ? "cluster" : "industry";
    const title = getString("good-at-title", {
      name: cityNamePossessive,
    });
    const para1 = getString(prefix + "-para-1", {
      city: cityName,
      "city-posessive": cityName,
      "peer-group": peerGroupName,
      "peer-group-possessive": peerGroupPossessive,
      its: its,
      the: the,
      "industrial-knowledge-cluster": industrialKnowledgeCluster,
      "industries-clusters": industrysClusters,
      "industry-cluster": industryCluster,
    });
    const para2 = getString(prefix + "-para-2", {
      city: cityName,
      "city-posessive": cityName,
      "peer-group": peerGroupName,
      "peer-group-possessive": peerGroupPossessive,
      its: its,
      the: the,
      "industrial-knowledge-cluster": industrialKnowledgeCluster,
      "industries-clusters": industrysClusters,
      "industry-cluster": industryCluster,
    });
    const para3 = getString(prefix + "-para-3", {
      city: cityName,
      "city-posessive": cityName,
      "peer-group": peerGroupName,
      "peer-group-possessive": peerGroupPossessive,
      its: its,
      the: the,
      "industrial-knowledge-cluster": industrialKnowledgeCluster,
      "industries-clusters": industrysClusters,
      "industry-cluster": industryCluster,
    });
    const para4 =
      prefix !== "absolute-nested-bar-chart"
        ? getString(prefix + "-para-4", {
            city: cityName,
            "city-posessive": cityName,
            "peer-group": peerGroupName,
            "peer-group-possessive": peerGroupPossessive,
            its: its,
            the: the,
            "industrial-knowledge-cluster": industrialKnowledgeCluster,
            "industries-clusters": industrysClusters,
            "industry-cluster": industryCluster,
          })
        : "";

    return (
      <StandardSideTextBlock>
        <Helmet>
          <title>
            {title + " | " + getString("meta-data-title-default-suffix")}
          </title>
          <meta
            property="og:title"
            content={
              title + " | " + getString("meta-data-title-default-suffix")
            }
          />
        </Helmet>
        <ContentTitle>{title}</ContentTitle>
        <ContentParagraph>{para1}</ContentParagraph>
        <ContentParagraph>{para2}</ContentParagraph>
        <ContentParagraph>{para3}</ContentParagraph>
        <ContentParagraph>{para4}</ContentParagraph>
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }
};

export default SideText;
