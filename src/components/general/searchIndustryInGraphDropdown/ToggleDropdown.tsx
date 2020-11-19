import React, {useState} from 'react';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import {DigitLevel} from '../../../types/graphQL/graphQLTypes';
import useFluent from '../../../hooks/useFluent';
import styled from 'styled-components/macro';
import {
  textClassName,
  ExpandingButton,
  collapsedSizeMediaQuery,
} from '../Utils';
import raw from 'raw.macro';

const readThisChartIconSVG = raw('../../../assets/icons/magnifying-glass.svg');

const Root = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: absolute;
  right: 0;
  width: 200px;
  z-index: 20;
`;

const ToggleButton = styled(ExpandingButton)`
  @media ${collapsedSizeMediaQuery} {
    right: 0;
    left: auto;
    z-index: 10;

    &:hover {
      .${textClassName} {
        width: 155px;
        /* max-width needed for safari */
        max-width: 155px;
      }
    }
  }
`;

export interface SearchInGraphOptions {
  disallowSelectionLevels: number[] | undefined;
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel | null;
  searchData: SearchDatum[];
}

const SearchIndustryInGraph = (props: SearchInGraphOptions) => {
  const {
    setHighlighted, digitLevel, disallowSelectionLevels, searchData,
  } = props;

  const getString = useFluent();

  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>();
  const [internalSelectedValue, setInternalSelectedValue] = useState<SearchDatum | null>();

  const onSelect = (d: SearchDatum | null) => {
    if (d) {
      setHighlighted(d.id as string);
    } else {
      setHighlighted(undefined);
    }
    setInternalSelectedValue(d);
    if (d === null) {
      setIsDropdownVisible(false);
    }
  };

  const dropdown = isDropdownVisible ? (
    <DropdownContainer>
      <PanelSearch
        key={'ButtonTogglePreChartPanelSearchKeyFor' + digitLevel}
        data={searchData}
        topLevelTitle={getString('global-text-industries')}
        disallowSelectionLevels={disallowSelectionLevels}
        defaultPlaceholderText={getString('global-ui-search-an-industry-in-graph')}
        showCount={true}
        resultsIdentation={1}
        onSelect={onSelect}
        maxResults={500}
        onClose={() => !internalSelectedValue ? setIsDropdownVisible(false) : null}
        focusOnRender={true}
      />
    </DropdownContainer>
  ) : null;

  return (
    <Root>
      <ToggleButton onClick={() => setIsDropdownVisible(true)}>
        <span dangerouslySetInnerHTML={{__html: readThisChartIconSVG}} />
        <div className={textClassName}>{getString('global-ui-search-an-industry-in-graph')}</div>
      </ToggleButton>
      {dropdown}
    </Root>
  );
};

export default React.memo(SearchIndustryInGraph);
