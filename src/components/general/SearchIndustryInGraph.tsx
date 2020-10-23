import React from 'react';
import SimpleLoader from '../transitionStateComponents/SimpleLoader';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import {
  useGlobalIndustryHierarchicalTreeData,
} from '../../hooks/useGlobalIndustriesData';
import SimpleError from '../transitionStateComponents/SimpleError';
import useSectorMap from '../../hooks/useSectorMap';
import {DigitLevel, ClassificationNaicsIndustry} from '../../types/graphQL/graphQLTypes';
import {
  SearchContainerLight,
  lightBaseColor,
} from '../../styling/styleUtils';
import useFluent from '../../hooks/useFluent';
import styled from 'styled-components/macro';

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchContainer = styled(SearchContainerLight)`
  max-width: 280px;
  font-size: 0.75rem;
  margin-right: 0.75rem;

  .react-panel-search-search-bar-input {
    font-size: 0.75rem;
    padding-left: 2rem;
  }

  .react-panel-search-search-bar-search-icon {
    width: 1.1rem;
  }
`;

export interface SearchInGraphOptions {
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel;
}

const SearchIndustryInGraph = (props: SearchInGraphOptions) => {
  const {
    hiddenSectors, setHighlighted, digitLevel,
  } = props;

  const getString = useFluent();
  const sectorMap = useSectorMap();
  const industrySearchData = useGlobalIndustryHierarchicalTreeData();

  let searchPanel: React.ReactElement<any> | null;
  if (industrySearchData.loading) {
    searchPanel = (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (industrySearchData.error !== undefined) {
    console.error(industrySearchData.error);
    searchPanel = (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if (hiddenSectors.length === sectorMap.length) {
    searchPanel = (
      <LoadingContainer>
        <SimpleError fluentMessageId={'error-message-no-industries'} />
      </LoadingContainer>
    );
  } else if (industrySearchData.data !== undefined) {
    const onSelect = (d: {id: string | number} | null) => {
      if (d) {
        setHighlighted(d.id as string);
      } else {
        setHighlighted(undefined);
      }
    };
    const searchData: SearchDatum[] = industrySearchData.data.filter(
      ({level, id}) => level <= digitLevel && !hiddenSectors.includes(id as string),
    );
    const disallowSelectionLevels = digitLevel
      ? Array.from(Array(digitLevel).keys()) : undefined;
    searchPanel = (
      <PanelSearch
        data={searchData}
        topLevelTitle={getString('global-text-industries')}
        disallowSelectionLevels={disallowSelectionLevels}
        defaultPlaceholderText={getString('global-ui-search-an-industry-in-graph')}
        showCount={true}
        resultsIdentation={1.75}
        onSelect={onSelect}
        maxResults={500}
      />
    );
  } else {
    searchPanel = null;
  }

  return (
    <SearchContainer>
      {searchPanel}
    </SearchContainer>
  );
};

export default React.memo(SearchIndustryInGraph);
