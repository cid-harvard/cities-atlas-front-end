import React from "react";
import StandardSideTextBlock from "../../../../../components/general/StandardSideTextBlock";
import {
  ContentParagraph,
  ContentTitle,
} from "../../../../../styling/styleUtils";
import useFluent, { possessive } from "../../../../../hooks/useFluent";
import useCurrentCity from "../../../../../hooks/useCurrentCity";
import StandardSideTextLoading from "../../../../../components/transitionStateComponents/StandardSideTextLoading";
import { isValidPeerGroup } from "../../../../../types/graphQL/graphQLTypes";
import useCurrentBenchmark from "../../../../../hooks/useCurrentBenchmark";
import Helmet from "react-helmet";

const SideText = ({ children }: { children: React.ReactNode }) => {
  const getString = useFluent();
  const { loading, city } = useCurrentCity();
  const { benchmark, benchmarkNameShort } = useCurrentBenchmark();
  const benchmarkType = isValidPeerGroup(benchmark)
    ? benchmark
    : benchmarkNameShort;
  if (loading) {
    return <StandardSideTextLoading />;
  } else if (city) {
    const cityName = city.name ? city.name : "";
    const cityNamePlural = possessive([cityName]);
    const title = getString("industry-space-title", {
      "name-plural": cityNamePlural,
    });
    const para1 = getString("industry-space-para-1", {
      name: cityName,
      "benchmark-type": benchmarkType,
    });
    const para2 = getString("industry-space-para-2", {
      name: cityName,
      "name-plural": cityNamePlural,
    });

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
        {children}
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }
};

export default SideText;
