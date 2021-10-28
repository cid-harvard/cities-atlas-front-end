import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React from 'react';
import {
  ContentScrollGrid,
} from '../../../../styling/styleUtils';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import Header from './Header';
import FilterBar from './FilterBar';
import Visualizations from './Visualizations';

const SimilarCities = () => {
  const cityId = useCurrentCityId();
  // const [timeStamp] = useState<number>(new Date().getTime());

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
      <ContentScrollGrid>
        <Header />
        <FilterBar />
        <Visualizations />
      </ContentScrollGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
