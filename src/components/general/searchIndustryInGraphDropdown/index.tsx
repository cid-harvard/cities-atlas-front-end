import React from 'react';
import SimpleLoader from '../../transitionStateComponents/SimpleLoader';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import {
  useGlobalIndustryHierarchicalTreeData,
} from '../../../hooks/useGlobalIndustriesData';
import {
  useGlobalClusterHierarchicalTreeData,
} from '../../../hooks/useGlobalClusterData';
import SimpleError from '../../transitionStateComponents/SimpleError';
import useSectorMap from '../../../hooks/useSectorMap';
import useClusterMap from '../../../hooks/useClusterMap';
import {DigitLevel} from '../../../types/graphQL/graphQLTypes';
import {
  SearchContainerLight,
  lightBaseColor,
} from '../../../styling/styleUtils';
import {collapsedSizeMediaQueryValues, collapsedSizeMediaQuery} from '../Utils';
import useFluent from '../../../hooks/useFluent';
import {useWindowSize} from 'react-use';
import styled from 'styled-components/macro';
import ToggleDropdown from './ToggleDropdown';
import {ClusterLevel} from '../../../routing/routes';

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

export enum Mode {
  naics = 'naics',
  cluster = 'cluster',
  geo = 'geo',
}

export interface SearchInGraphOptions {
  hiddenParents: string[];
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel | null;
  clusterLevel: ClusterLevel | null;
  mode: Mode;
}

const SearchIndustryInGraph = (props: SearchInGraphOptions) => {
  const {
    hiddenParents, setHighlighted, digitLevel, clusterLevel, mode,
  } = props;

  const getString = useFluent();
  const sectorMap = useSectorMap();
  const clusterMap = useClusterMap();
  const industrySearchData = useGlobalIndustryHierarchicalTreeData();
  const clusterSearchData = useGlobalClusterHierarchicalTreeData();
  const windowDimensions = useWindowSize();

  let hierarchalSearchData: undefined | SearchDatum[];
  let tiers: DigitLevel | ClusterLevel | null;
  let disallowSelectionLevels: number[] | undefined;
  let defaultPlaceholderText: string;
  let topLevelTitle: string;
  if (mode === Mode.naics) {
    hierarchalSearchData = industrySearchData.data;
    tiers = digitLevel;
    disallowSelectionLevels = tiers
      ? Array.from(Array(tiers).keys()) : undefined;
    defaultPlaceholderText = getString('global-ui-search-an-industry-in-graph');
    topLevelTitle = getString('global-text-industries');
  } else if (mode === Mode.cluster) {
    hierarchalSearchData = clusterSearchData.data;
    tiers = clusterLevel;
    disallowSelectionLevels = clusterLevel === ClusterLevel.C3 ? [1] : undefined;
    defaultPlaceholderText = getString('global-ui-search-a-cluster-in-graph');
    topLevelTitle = getString('global-ui-skill-clusters');
  } else {
    hierarchalSearchData = [];
    tiers = null;
    defaultPlaceholderText = '';
    topLevelTitle = '';
  }

  let searchPanel: React.ReactElement<any> | null;
  if ((mode === Mode.naics && industrySearchData.loading) || (mode === Mode.cluster && clusterSearchData.loading)) {
    searchPanel = (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (mode === Mode.naics && industrySearchData.error !== undefined) {
    console.error(industrySearchData.error);
    searchPanel = (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if (mode === Mode.cluster && clusterSearchData.error !== undefined) {
    console.error(clusterSearchData.error);
    searchPanel = (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if ((mode === Mode.naics && hiddenParents.length === sectorMap.length) ||
      (mode === Mode.cluster && hiddenParents.length === clusterMap.length)) {
    searchPanel = (
      <LoadingContainer>
        <SimpleError fluentMessageId={'error-message-no-industries'} />
      </LoadingContainer>
    );
  } else if (hierarchalSearchData !== undefined) {
    const onSelect = (d: {id: string | number} | null) => {
      if (d) {
        setHighlighted(d.id as string);
      } else {
        setHighlighted(undefined);
      }
    };
    const searchData: SearchDatum[] = hierarchalSearchData.filter(
      ({level, id}) => (tiers === null || (level !== null && level <= tiers)) &&
                        !hiddenParents.includes(id as string),
    );

    if (windowDimensions.width > collapsedSizeMediaQueryValues.max ||
        windowDimensions.width < collapsedSizeMediaQueryValues.min) {
      searchPanel = (
        <PanelSearch
          key={'PreChartPanelSearchKeyFor' + tiers}
          data={searchData}
          topLevelTitle={topLevelTitle}
          disallowSelectionLevels={disallowSelectionLevels}
          defaultPlaceholderText={defaultPlaceholderText}
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
          rerenderKey={`${digitLevel}${clusterLevel}${mode}`}
          searchData={searchData}
          defaultPlaceholderText={defaultPlaceholderText}
          topLevelTitle={topLevelTitle}
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
