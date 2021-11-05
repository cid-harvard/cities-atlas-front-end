import { DefaultContentWrapper } from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import { LoadingOverlay } from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React from 'react';
import {
  ContentGrid,
} from '../../../../styling/styleUtils';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';

const SimilarCities = () => {
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

      <ContentGrid>
        <h1>Overview</h1>
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
