import React, {useState, useRef} from 'react';
import BasicModal from '../../standardModal/BasicModal';
import styled from 'styled-components/macro';
import {
  secondaryFont,
  SearchContainerDark,
  backgroundDark,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';
import PanelSearch, {Datum} from 'react-panel-search';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import useGlobalLocationData from '../../../hooks/useGlobalLocationData';
import {
  useHistory,
} from 'react-router-dom';
import queryString from 'query-string';
import useQueryParams from '../../../hooks/useQueryParams';

const mobileWidth = 750; // in px

const Root = styled.div`
  font-family: ${secondaryFont};
  color: #fff;
  width: 800px;
  max-width: 100%;
  height: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const H1 = styled.h1`
  text-transform: uppercase;
  font-weight: 400;
  text-align: center;
  margin-bottom: 4rem;
`;

const Label = styled.label`
  text-transform: uppercase;
  padding-bottom: 0.2rem;
  display: inline-block;
`;

const LabelUnderline = styled(Label)`
  border-bottom: solid 1px #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-gap: 2rem;

  @media (max-width: ${mobileWidth}px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }

  .react-panel-search-search-bar-input {
    background-color: #454a4f;
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-search-results {
    background-color: #454a4f;
  }
`;

const Or = styled.div`
  text-transform: uppercase;
  font-size: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:before,
  &:after {
    content: '';
    height: 5rem;
    width: 0;
    border-right: solid 2px #fff;
  }

  &:before {
    margin-bottom: 0.5rem;
  }

  &:after {
    margin-top: 0.5rem;
  }

  @media (max-width: ${mobileWidth}px) {
    flex-direction: row;

    &:before,
    &:after {
      content: '';
      height: 0;
      width: 3rem;
      border-top: solid 2px #fff;
    }

    &:before {
      margin-bottom: 0;
      margin-right: 0.5rem;
    }

    &:after {
      margin-left: 0.5rem;
      margin-top: 0;
    }
  }
`;

const ContinueButtonContainer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
`;

const ContinueButton = styled.button`
  background-color: transparent;
  border: solid 1px #fff;
  text-transform: uppercase;
  color: #fff;
  font-family: ${secondaryFont};
  font-size: 1.25rem;
  padding: 0.6rem 1rem;
  transition: opacity 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #fff;
    color: ${backgroundDark};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

interface Props {
  closeModal: () => void;
  data: Datum[];
}

const AddComparisonModal = (props: Props) => {
  const {closeModal, data} = props;
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedCity, setSelectedCity] = useState<Datum | null>(null);
  const {data: globalData} = useGlobalLocationData();
  const history = useHistory();
  const { compare_city, ...otherParams } = useQueryParams();

  const currentCity = globalData ? globalData.cities.find(c => c.cityId === cityId) : undefined;
  const name = currentCity ? currentCity.name : '';

  const selectCity = (city: Datum | null) => {
    setSelectedCity(city);
    if (continueButtonRef && continueButtonRef.current) {
      const node = continueButtonRef.current;
      setTimeout(() => {
        node.focus();
      }, 0);
    }
  };

  const onContinue = () => {
    if (selectedCity) {
      const query = queryString.stringify({...otherParams, compare_city: selectedCity.id});
      const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
      history.push(newUrl);
      closeModal();
    }
  };

  return (
    <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
      <Root>
        <H1>{getString('global-ui-compare-title', {name})}:</H1>
        <SearchContainerDark>
          <Grid>
            <div>
              <Label>{getString('global-ui-select-a-city-name')}</Label>
              <PanelSearch
                data={data.filter(({id}) => id !== cityId)}
                topLevelTitle={getString('global-text-countries')}
                disallowSelectionLevels={['0']}
                defaultPlaceholderText={getString('global-ui-type-a-city-name')}
                showCount={true}
                resultsIdentation={1.75}
                neverEmpty={false}
                maxResults={500}
                selectedValue={selectedCity}
                onSelect={selectCity}
                focusOnRender={true}
              />
            </div>
            <Or>{getString('global-ui-or')}</Or>
            <div>
              <LabelUnderline>{getString('global-ui-select-a-group')}</LabelUnderline>
            </div>
          </Grid>
        </SearchContainerDark>
        <ContinueButtonContainer>
          <ContinueButton

            onClick={onContinue}
            ref={continueButtonRef}
          >
            {getString('global-ui-continue')}
          </ContinueButton>
        </ContinueButtonContainer>
      </Root>
    </BasicModal>
  );
};

export default AddComparisonModal;
