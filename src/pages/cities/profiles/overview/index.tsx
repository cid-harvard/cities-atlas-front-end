import { breakPoints, DefaultContentWrapper } from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import { LoadingOverlay } from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import styled from 'styled-components';
import Widgets from './widgets';
import Concepts from './concepts';
import Map from './map';

const Root = styled.div`
  padding: 1.5rem 0.75rem 2.5rem;
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-height: 100%;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 1.25fr;
  grid-template-areas:
            "widgets widgets"
            "map concepts";
  gap: 1.5rem;

  @media (max-height: 750px) {
    gap: 0.75rem;
  }

  @media ${breakPoints.small} {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr;
    grid-template-areas:
              "widgets"
              "map"
              "concepts";
  }
`;

const ContentBlock = styled.div`
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
`;

const WidgetContainer = styled(ContentBlock)`
  grid-area: widgets;
  padding: 1rem;

  @media (max-height: 750px) {
    padding: 0.5rem 0.25rem;
  }
`;

const MapContainer = styled(ContentBlock)`
  grid-area: map;
`;

const ConceptsContainer = styled(ContentBlock)`
  grid-area: concepts;
  position: relative;
`;

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
      <Root>
        <WidgetContainer>
          <Widgets />
        </WidgetContainer>
        <MapContainer>
          <Map key={new Date().getTime()} />
        </MapContainer>
        <ConceptsContainer>
          <Concepts />
        </ConceptsContainer>
      </Root>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
