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
  isValidPeerGroup,
} from '../../../../types/graphQL/graphQLTypes';
import useCurrentBenchmark from '../../../../hooks/useCurrentBenchmark';

const SideText = () => {
  const getString = useFluent();
  const {loading, city} = useCurrentCity();
  const { benchmark, benchmarkNameShort } = useCurrentBenchmark();
  const benchmarkType = isValidPeerGroup(benchmark) ? benchmark : benchmarkNameShort;
  if (loading) {
    return <StandardSideTextLoading />;
  } else if (city) {
    const cityName = city.name ? city.name : '';
    const title = getString('good-at-title', {
      'name': cityName,
    });
    const para1 = getString('good-at-para-1', {
      'name': cityName,
      'benchmark-type': benchmarkType,
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
