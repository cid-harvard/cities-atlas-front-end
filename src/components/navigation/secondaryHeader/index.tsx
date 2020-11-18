import React from 'react';
import {SecondaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import {
  backgroundMedium,
  defaultPadding,
  secondaryFont,
  SearchContainerLight,
} from '../../../styling/styleUtils';
import {UtilityBarPortal} from './UtilityBar';
import {columnsToRowsBreakpoint, mediumSmallBreakpoint} from '../Utils';
import CitySearch from './CitySearch';
import {
  Route,
  Switch,
} from 'react-router-dom';
import {CityRoutes} from '../../../routing/routes';

const Root = styled(SecondaryHeaderContainer)`
  background-color: ${backgroundMedium};
  padding: 0.55rem ${defaultPadding}rem;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 0.7rem;
  pointer-events: auto;
  min-height: 50px;

  @media (max-width: 1100px) {
    padding: 0.55rem;
  }

  @media (max-width: ${mediumSmallBreakpoint}px) {
    min-height: 63px;
  }

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    grid-template-columns: auto;
    grid-rows-columns: auto auto;
    padding-bottom: 0.45rem;
    min-height: 83px;
  }
`;

const SearchContainer = styled(SearchContainerLight)`
  max-width: 800px;
  width: 100%;
  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input {
    background-color: ${backgroundMedium};
    padding: 0.4rem 0.5rem;

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
  }

  .react-panel-search-search-bar-search-icon {
    display: none;
  }

  .react-panel-search-search-bar-dropdown-arrow,
  .react-panel-search-search-bar-clear-button {
    background-color: ${backgroundMedium};
  }

`;

const SecondaryHeader = () => {
  return (
    <Root>
      <SearchContainer>
        <Switch>
          <Route path={CityRoutes.CityBase} component={CitySearch} />
        </Switch>
      </SearchContainer>
      <UtilityBarPortal />
    </Root>
  );
};

export default SecondaryHeader;
