import React from 'react';
import SimpleLoader from '../../transitionStateComponents/SimpleLoader';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import {
  useGlobalIndustryHierarchicalTreeData,
} from '../../../hooks/useGlobalIndustriesData';
import SimpleError from '../../transitionStateComponents/SimpleError';
import useSectorMap from '../../../hooks/useSectorMap';
import {DigitLevel, ClassificationNaicsIndustry} from '../../../types/graphQL/graphQLTypes';
import {
  SearchContainerLight,
  lightBaseColor,
} from '../../../styling/styleUtils';
import {collapsedSizeMediaQueryValues, collapsedSizeMediaQuery} from '../Utils';
import useFluent from '../../../hooks/useFluent';
import {useWindowSize} from 'react-use';
import styled from 'styled-components/macro';
import ToggleDropdown from './ToggleDropdown';

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchContainer = styled(SearchContainerLight)`
  max-width: 100%;
  font-size: 0.5rem;
  margin-right: 0.75rem;

  .react-panel-search-search-results {
    overflow-x: hidden;
  }

  .react-panel-search-search-bar-input {
    font-size: 0.65rem;
    padding-left: 1.15rem;
  }

  .react-panel-search-search-bar-search-icon {
    width: 0.7rem;
    margin: 0 0.3rem;
  }

  .react-panel-search-current-tier-static-title-outer,
  .react-panel-search-current-tier-breadcrumb-outer {
    padding: 0.55rem 0.45rem 0.55rem 0.4rem;
  }

  .react-panel-search-list-item,
  .react-panel-search-current-tier-title {
    font-size: 0.65rem;
    padding: 0.55rem 1.25rem 0.55rem 0.5rem;
  }

  .react-panel-search-current-tier-title {
    padding-left: 0;
    padding-right: 0;
    padding-top: 0.2rem;
    grid-gap: 0;
  }

  .react-panel-search-current-tier-text {
    padding: 0;
  }

  .react-panel-search-next-button,
  .react-panel-search-previous-button {
    width: 0.9rem;
    height: 0.9rem;
    padding: 0;

    svg {
      width: 0.6rem;
    }
  }
  .react-panel-search-next-button {
    margin: auto 6px;
  }

  .react-panel-search-search-bar-dropdown-arrow {
    width: 0.6rem;
    padding: 0.18rem;
  }

  .react-panel-search-list-no-results div {
    font-size: 0.65rem;
    padding: 0.5rem;
  }

  @media ${collapsedSizeMediaQuery} {
    width: auto;
    flex-shrink: 1;
    height: 100%;
    align-items: center;
  }
`;

export interface SearchInGraphOptions {
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel | null;
}

const SearchIndustryInGraph = (props: SearchInGraphOptions) => {
  const {
    hiddenSectors, setHighlighted, digitLevel,
  } = props;

  const getString = useFluent();
  const sectorMap = useSectorMap();
  const industrySearchData = useGlobalIndustryHierarchicalTreeData();
  const windowDimensions = useWindowSize();

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
      ({level, id}) => (digitLevel === null || (level !== null && level <= digitLevel)) &&
                        !hiddenSectors.includes(id as string),
    );
    const disallowSelectionLevels = digitLevel
      ? Array.from(Array(digitLevel).keys()) : undefined;

    if (windowDimensions.width > collapsedSizeMediaQueryValues.max ||
        windowDimensions.width < collapsedSizeMediaQueryValues.min) {
      searchPanel = (
        <PanelSearch
          key={'PreChartPanelSearchKeyFor' + digitLevel}
          data={searchData}
          topLevelTitle={getString('global-text-industries')}
          disallowSelectionLevels={disallowSelectionLevels}
          defaultPlaceholderText={getString('global-ui-search-an-industry-in-graph')}
          showCount={true}
          resultsIdentation={1}
          onSelect={onSelect}
          maxResults={500}
        />
      );
    } else {
      searchPanel = (
        <ToggleDropdown
          disallowSelectionLevels={disallowSelectionLevels}
          setHighlighted={setHighlighted}
          digitLevel={digitLevel}
          searchData={searchData}
        />
      );
    }
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
