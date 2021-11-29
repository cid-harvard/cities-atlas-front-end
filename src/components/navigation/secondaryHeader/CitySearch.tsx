import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
} from '../../../styling/styleUtils';
import matchingKeywordFormatter from '../../../styling/utils/panelSearchKeywordFormatter';
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
import {TooltipTheme} from '../../general/Tooltip';
import useCurrentBenchmark from '../../../hooks/useCurrentBenchmark';

const Root = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-gap: 1rem;
  height: 100%;
  align-items: center;

  @media (max-width: 500px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }
`;

const SearchContainer = styled.div`
  width: 200px;
  width: clamp(200px, 25vw, 300px);

  @media (max-width: 500px) {
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  width: clamp(200px, 25vw, 300px);

  @media (max-width: 500px) {
    width: 100%;
  }
`;

interface Props {
  searchContainerWidth?: string;
}

const CitySearch = ({ searchContainerWidth }: Props) => {
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const history = useHistory();
  const { benchmark } = useCurrentBenchmark();

  const {loading, error, data} = useGlobalLocationHierarchicalTreeData();
  let output: React.ReactElement<any> | null;
  if (loading) {
    output = (
      <LoadingContainer
        style={searchContainerWidth ? { width: searchContainerWidth } : undefined}
      >
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (error !== undefined) {
    console.error(error);
    output = (
      <LoadingContainer
        style={searchContainerWidth ? { width: searchContainerWidth } : undefined}
      >
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
            history.push(createRoute.city(match.path as ValueOfCityRoutes, d.id.toString()) + history.location.search);
          }
        });
      }
    };

    const dataWithoutCurrentComparisonOrBenchmark = benchmark !== undefined
      ? data.filter(({id}) => id !== benchmark) : data;

    output = (
      <>
        <SearchContainer
          style={searchContainerWidth ? { width: searchContainerWidth } : undefined}
        >
          <PanelSearch
            data={dataWithoutCurrentComparisonOrBenchmark}
            topLevelTitle={getString('global-text-countries')}
            disallowSelectionLevels={['0']}
            defaultPlaceholderText={getString('global-ui-type-a-city-name')}
            showCount={true}
            resultsIdentation={1.75}
            neverEmpty={true}
            selectedValue={initialSelected ? initialSelected : undefined}
            onSelect={onSelect}
            maxResults={500}
            matchingKeywordFormatter={matchingKeywordFormatter(TooltipTheme.Light)}
          />
        </SearchContainer>
      </>
    );
  } else {
    output = null;
  }
  return (
    <Root>{output}</Root>
  );
};

export default CitySearch;
