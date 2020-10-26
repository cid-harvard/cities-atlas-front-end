import React from 'react';
import TopIndustryComparisonBarChart from
  '../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart';
import {defaultYear} from '../../../../../Utils';
import {
  DigitLevel,
  CompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';

interface Props {
  primaryCity: string;
  secondaryCity: string;
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity, secondaryCity,
  } = props;

  return (
    <>
      <ContentGrid>
        <TopIndustryComparisonBarChart
          primaryCity={parseInt(primaryCity, 10)}
          secondaryCity={parseInt(secondaryCity, 10)}
          year={defaultYear}
          highlighted={undefined}
          digitLevel={DigitLevel.Three}
          compositionType={CompositionType.Companies}
          hiddenSectors={[]}
          setHighlighted={() => {}}
          openHowToReadModal={() => {}}
        />
      </ContentGrid>
    </>
  );
};

export default React.memo(CompositionComparison);
