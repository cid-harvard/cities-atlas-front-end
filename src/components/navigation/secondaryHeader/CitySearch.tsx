import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
} from '../../../styling/styleUtils';
import PanelSearch, {Datum} from 'react-panel-search';
import useFluent from '../../../hooks/useFluent';
import {useGlobalLocationHierarchicalTreeData} from '../../../hooks/useGlobalLocationData';
import SimpleLoader from '../../transitionStateComponents/SimpleLoader';
import SimpleError from '../../transitionStateComponents/SimpleError';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import {
  CityRoutes,
  cityIdParam,
} from '../../../routing/routes';
import {ValueOfCityRoutes, createRoute} from '../../../routing/Utils';

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SecondaryHeader = () => {
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const history = useHistory();

  const {loading, error, data} = useGlobalLocationHierarchicalTreeData();
  if (loading) {
    return (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (error !== undefined) {
    console.error(error);
    return (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if (data !== undefined) {
    const initialSelected = data.find(({id}) => id === cityId);
    const onSelect = (d: Datum | null) => {
      if (d) {
        Object.entries(CityRoutes).forEach(([_key, value]) => {
          const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, value);
          if (match && match.isExact && match.path) {
            history.push(createRoute.city(match.path as ValueOfCityRoutes, d.id.toString()));
          }
        });
      }
    };
    return (
      <PanelSearch
        data={data}
        topLevelTitle={getString('global-text-countries')}
        disallowSelectionLevels={['0']}
        defaultPlaceholderText={getString('global-ui-type-a-city-name')}
        showCount={true}
        resultsIdentation={1.75}
        neverEmpty={true}
        selectedValue={initialSelected ? initialSelected : undefined}
        onSelect={onSelect}
        maxResults={500}
      />
    );
  } else {
    return null;
  }
};

export default SecondaryHeader;
