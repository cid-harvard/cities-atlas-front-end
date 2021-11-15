import React from 'react';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import CityComposition from './cityComposition';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';

const EconomicComposition = () => {
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

  return (
    <DefaultContentWrapper>
      <CityComposition
        cityId={cityId}
      />
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
