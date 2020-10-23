import React from 'react';
import {SecondaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import {
  backgroundMedium,
  defaultPadding,
  secondaryFont,
  SearchContainerLight,
} from '../../../styling/styleUtils';
import {UtilityBarPortal, columnsToRowsBreakpoint} from './UtilityBar';
import CitySearch from './CitySearch';
import {
  Route,
  Switch,
} from 'react-router-dom';
import {CityRoutes} from '../../../routing/routes';

const Root = styled(SecondaryHeaderContainer)`
  background-color: ${backgroundMedium};
  padding: ${defaultPadding * 0.5}rem ${defaultPadding}rem;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 0.7rem;
  pointer-events: auto;

  @media (max-width: 1100px) {
    padding: ${defaultPadding * 0.5}rem;
  }

  @media (max-width: ${columnsToRowsBreakpoint}px) {
    grid-template-columns: auto;
    grid-rows-columns: auto auto;
    padding-bottom: 0.45rem;
  }
`;

const SearchContainer = styled(SearchContainerLight)`
  max-width: 800px;
  width: 100%;
  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input {
    background-color: ${backgroundMedium};

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
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
