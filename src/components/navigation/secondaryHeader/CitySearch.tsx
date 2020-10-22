import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
  errorColor,
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
  GlobalQueryParams,
} from '../../../routing/routes';
import {ValueOfCityRoutes, createRoute} from '../../../routing/Utils';
import queryString from 'query-string';
import AddComparisonModal from './AddComparisonModal';

const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  grid-gap: 1rem;
`;

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompareDropdownRoot = styled.div`
  padding-left: 1rem;
  border-left: solid 1px #333;
`;

const ButtonBase = styled.button`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  text-transform: uppercase;
  padding: 0 0.25rem;
  transition: outline 0.1s ease;

  &:before {
    content: '+';
    margin-right: 0.15rem;
    line-height: 0;
  }
`;

const AddComparisonButton = styled(ButtonBase)`
  font-size: 1.1rem;
  outline: 0 solid rgba(255, 255, 255, 0);

  &:before {
    font-size: 2rem;
    content: '+';
  }

  &:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }
`;

const RemoveComparisonButton = styled(ButtonBase)`
  font-size: 1rem;
  color: ${errorColor};
  outline: 0 solid rgba(255, 255, 255, 0);

  &:before {
    font-size: 1.5rem;
    content: '✕';
  }

  &:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }
`;

const SecondaryHeader = () => {
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const history = useHistory();
  const { compare_city, ...otherParams } = queryString.parse(history.location.search) as unknown as GlobalQueryParams;
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const {loading, error, data} = useGlobalLocationHierarchicalTreeData();
  let output: React.ReactElement<any> | null;
  if (loading) {
    output = (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (error !== undefined) {
    console.error(error);
    output = (
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
            history.push(createRoute.city(match.path as ValueOfCityRoutes, d.id.toString()) + history.location.search);
          }
        });
      }
    };
    let compareDropdown: React.ReactElement<any>;
    if (compare_city === undefined) {
      compareDropdown = (
        <div>
          <AddComparisonButton onClick={() => setModalOpen(true)}>
            {getString('global-ui-add-comparison')}
          </AddComparisonButton>
        </div>
      );
    } else {
      const onSelectComparison = (d: Datum | null) => {
        if (d) {
          const query = queryString.stringify({...otherParams, compare_city: d.id});
          const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
          history.push(newUrl);
        }
      };
      const removeComparison = () => {
        const query = queryString.stringify({...otherParams});
        const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
        history.push(newUrl);
      };
      compareDropdown = (
        <>
          <CompareDropdownRoot>
            <PanelSearch
              data={data.filter(({id}) => id !== cityId)}
              topLevelTitle={getString('global-text-countries')}
              disallowSelectionLevels={['0']}
              defaultPlaceholderText={getString('global-ui-type-a-city-name')}
              showCount={true}
              resultsIdentation={1.75}
              neverEmpty={true}
              selectedValue={data.find(({id}) => id === compare_city)}
              onSelect={onSelectComparison}
              maxResults={500}
            />
          </CompareDropdownRoot>
          <div>
            <RemoveComparisonButton onClick={removeComparison}>
              {getString('global-ui-remove-comparison')}
            </RemoveComparisonButton>
          </div>
        </>
      );
    }
    const closeModal = () => {
      setModalOpen(false);
    };
    const compareModal = modalOpen ? (
      <AddComparisonModal
        closeModal={closeModal}
        data={data}
      />
    ) : null;
    output = (
      <>
        <PanelSearch
          data={compare_city !== undefined ? data.filter(({id}) => id !== compare_city) : data}
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
        {compareDropdown}
        {compareModal}
      </>
    );
  } else {
    output = null;
  }
  return (
    <Root>{output}</Root>
  );
};

export default SecondaryHeader;
