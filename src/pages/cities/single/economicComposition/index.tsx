import React from 'react';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import CityComposition from './cityComposition';
import Comparison from './comparison';
import useQueryParams from '../../../../hooks/useQueryParams';

const EconomicComposition = () => {
  const { compare_city } = useQueryParams();

  const output = compare_city === undefined ? (
    <CityComposition />
  ) : (
    <Comparison />
  );

  return (
    <DefaultContentWrapper>
      {output}
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
