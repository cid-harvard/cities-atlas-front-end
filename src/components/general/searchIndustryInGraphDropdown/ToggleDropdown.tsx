import React, { useState } from "react";
import PanelSearch, { Datum as SearchDatum } from "react-panel-search";
import useFluent from "../../../hooks/useFluent";
import styled, { keyframes } from "styled-components/macro";
import {
  textClassName,
  ExpandingButton,
  collapsedSizeMediaQuery,
} from "../Utils";
import raw from "raw.macro";

const readThisChartIconSVG = raw("../../../assets/icons/magnifying-glass.svg");

const Root = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

const jumpIn = keyframes`
  0% {
    transform: scale(0.92);
  }

  75% {
    transform: scale(1.03);
  }

  90% {
    transform: scale(0.95);
  }

  100% {
    transform: scale(1);
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  right: -0.7rem;
  width: 200px;
  z-index: 200;
  transform: scale(0.92);
  animation: ${jumpIn} 0.2s ease-in-out 1 forwards;

  button.react-panel-search-search-bar-clear-button {
    padding: 0.4rem 0.1rem;
  }
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
  disallowSelectionLevels: (number | string)[] | undefined;
  setHighlighted: (value: string | undefined) => void;
  rerenderKey: string;
  searchData: SearchDatum[];
  defaultPlaceholderText: string;
  topLevelTitle: string;
}

const SearchIndustryInGraph = (props: SearchInGraphOptions) => {
  const {
    setHighlighted,
    rerenderKey,
    disallowSelectionLevels,
    searchData,
    defaultPlaceholderText,
    topLevelTitle,
  } = props;

  const getString = useFluent();

  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>();
  const [internalSelectedValue, setInternalSelectedValue] =
    useState<SearchDatum | null>();

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
        key={"ButtonTogglePreChartPanelSearchKeyFor" + rerenderKey}
        data={searchData}
        topLevelTitle={topLevelTitle}
        disallowSelectionLevels={disallowSelectionLevels}
        defaultPlaceholderText={defaultPlaceholderText}
        showCount={true}
        resultsIdentation={1}
        onSelect={onSelect}
        maxResults={500}
        onClose={() =>
          !internalSelectedValue ? setIsDropdownVisible(false) : null
        }
        focusOnRender={true}
      />
    </DropdownContainer>
  ) : null;

  return (
    <Root>
      <ToggleButton onClick={() => setIsDropdownVisible(true)}>
        <span dangerouslySetInnerHTML={{ __html: readThisChartIconSVG }} />
        <div className={textClassName}>
          {getString("global-ui-search-an-industry-in-graph")}
        </div>
      </ToggleButton>
      {dropdown}
    </Root>
  );
};

export default React.memo(SearchIndustryInGraph);
