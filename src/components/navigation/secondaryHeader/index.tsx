import React from 'react';
import {SecondaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import {
  backgroundMedium,
  defaultPadding,
  secondaryFont,
  tertiaryColor,
  lightBaseColor,
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

const SearchContainer = styled.div`
  max-width: 800px;
  width: 100%;
  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-search-icon {
    display: none;
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 1rem;
    background-color: ${backgroundMedium};
    border: solid 1px ${lightBaseColor};
    box-shadow: none;
    outline: none;
    padding: 0.4rem 0.5rem;

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
  }

  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: ${lightBaseColor};
    }
  }
  .react-panel-search-search-bar-dropdown-arrow {
    width: 1rem;
  }
  .react-panel-search-search-bar-dropdown-arrow,
  .react-panel-search-search-bar-clear-button {
    background-color: ${backgroundMedium};
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: ${lightBaseColor};
    }
  }

  .react-panel-search-search-results {
    border-left: solid 1px ${lightBaseColor};
    border-right: solid 1px ${lightBaseColor};
    border-bottom: solid 1px ${lightBaseColor};
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    border-color: ${tertiaryColor};
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
