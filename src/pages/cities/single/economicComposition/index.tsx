import React from 'react';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import CityComposition from './cityComposition';
import Comparison from './comparison';
import useQueryParams from '../../../../hooks/useQueryParams';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';

const EconomicComposition = () => {
  const { compare_city } = useQueryParams();
  const cityId = useCurrentCityId();

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  const output = compare_city === undefined ? (
    <CityComposition
      cityId={cityId}
    />
  ) : (
    <Comparison
      primaryCity={cityId}
      secondaryCity={compare_city}
    />
  );

  return (
    <DefaultContentWrapper>
      {output}
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
