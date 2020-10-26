import React from 'react';
import TopIndustryComparisonBarChart from
  '../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart';
import {defaultYear} from '../../../../../Utils';
import {
  defaultCompositionType,
  CompositionType,
  defaultDigitLevel,
} from '../../../../../types/graphQL/graphQLTypes';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';
import useQueryParams from '../../../../../hooks/useQueryParams';

interface Props {
  primaryCity: string;
  secondaryCity: string;
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity, secondaryCity,
  } = props;

  const {digit_level, composition_type} = useQueryParams();

  return (
    <>
      <ContentGrid>
        <TopIndustryComparisonBarChart
          primaryCity={parseInt(primaryCity, 10)}
          secondaryCity={parseInt(secondaryCity, 10)}
          year={defaultYear}
          highlighted={undefined}
          digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
          hiddenSectors={[]}
          setHighlighted={() => {}}
          openHowToReadModal={() => {}}
        />
      </ContentGrid>
    </>
  );
};

export default CompositionComparison;
