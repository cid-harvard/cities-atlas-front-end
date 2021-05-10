import React, {useState, useRef} from 'react';
import BasicModal from '../../../standardModal/BasicModal';
import styled from 'styled-components/macro';
import {
  secondaryFont,
  primaryFont,
  SearchContainerDark,
  backgroundDark,
  radioButtonCss,
  primaryColor,
} from '../../../../styling/styleUtils';
import useFluent from '../../../../hooks/useFluent';
import PanelSearch, {Datum} from 'react-panel-search';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import useGlobalLocationData from '../../../../hooks/useGlobalLocationData';
import {
  useHistory,
  Route,
  Switch,
} from 'react-router-dom';
import queryString from 'query-string';
import useQueryParams from '../../../../hooks/useQueryParams';
import {RegionGroup} from '../../../dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import matchingKeywordFormatter from '../../../../styling/utils/panelSearchKeywordFormatter';
import {TooltipTheme} from '../../../general/Tooltip';
import {PeerGroup, isValidPeerGroup, CityPeerGroupCounts} from '../../../../types/graphQL/graphQLTypes';
import { useQuery, gql } from '@apollo/client';
import {CityRoutes} from '../../../../routing/routes';

const PEER_GROUP_CITY_COUNT = gql`
  query GetPeerGroupCityCounts($cityId: Int!) {
    cityPeerGroupCounts(cityId: $cityId) {
      cityId
      globalPop
      globalIncome
      globalEucdist
      regionalPop
      regionalIncome
      regionalEucdist
      region
    }
  }
`;

enum PeerGroupCountFields {
  globalPop = 'globalPop',
  globalIncome = 'globalIncome',
  globalEucdist = 'globalEucdist',
  regionalPop = 'regionalPop',
  regionalIncome = 'regionalIncome',
  regionalEucdist = 'regionalEucdist',
  region = 'region',
}

interface SuccessResponse {
  cityPeerGroupCounts: CityPeerGroupCounts;
}

const mobileWidth = 750; // in px

const Root = styled.div`
  font-family: ${secondaryFont};
  color: #fff;
  width: 800px;
  max-width: 100%;
  height: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;

  @media (max-width: 900px), (max-height: 700px) {
    width: 100%;
    max-height: initial;
    padding: 1rem;
  }
`;

const H1 = styled.h1`
  text-transform: uppercase;
  font-weight: 400;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  text-transform: uppercase;
  padding-bottom: 0.2rem;
  display: block;
  width: 100%;
`;

const LabelUnderline = styled(Label)`
  border-bottom: solid 1px #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr auto 1fr;
  grid-gap: 2rem;

  @media (max-width: ${mobileWidth}px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }

  .react-panel-search-search-bar-input {
    background-color: ${backgroundDark};
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-search-results {
    background-color: ${backgroundDark};
  }
`;

const GlobalVRegionalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.75rem;
`;

const GroupContainer = styled.ul`
  border-top: solid 1px #fff;
  padding: 0;
  margin: 0;
`;

const ContainerTitle = styled.h3`
  color: #fff;
  font-weight: 400;
  margin-bottom: 0.4rem;
  font-family: ${primaryFont};

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 1.1rem;
  }
`;

const Or = styled.div`
  text-transform: uppercase;
  font-size: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: ${primaryFont};

  &:before,
  &:after {
    content: '';
    height: auto;
    flex-grow: 1;
    width: 0;
    border-right: solid 2px #fff;
  }

  &:before {
    margin-bottom: 0.5rem;
  }

  &:after {
    margin-top: 0.5rem;
  }

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 1.1rem;
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
  padding: 2rem 1rem 1rem;
  position: sticky;
  bottom: 0;
  pointer-events: none;

  @media (max-width: 750px) {
    position: relative;
  }
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
  background-color: ${backgroundDark};
  pointer-events: all;

  &:hover:not(:disabled) {
    background-color: #fff;
    color: ${backgroundDark};
  }

  &:disabled {
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 1rem;
  }
`;

const GroupsList = styled.ul`
  padding: 0;
  margin: 0;
`;

const GroupItem = styled.li`
  margin-bottom: 0.5rem;
  display: block;
  list-style: none;
  font-size: 1rem;
  font-family: ${primaryFont};

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 0.8rem;
  }
`;

const GroupRadio = styled.div`
  ${radioButtonCss}
  cursor: pointer;
  padding: 0.5rem 0.25rem;

  small {
    color: #b9c4ce;
  }

  &:hover {
    background-color: #fff;

    small, em {
      color: inherit;
    }
  }

  &:before {
    margin-right: 16px;
  }

`;
const AboutText = styled.p`
  color: #fff;
  padding: 0 1.5rem;
  margin: 0 0 1rem;
  font-family: ${primaryFont};

  @media (max-width: 900px), (max-height: 700px) {
    font-size: 0.8rem;
  }
`;

const Recommended = styled.em`
  font-size: smaller;
  color: ${primaryColor};
`;

interface Props {
  closeModal: (value: string | undefined) => void;
  data: Datum[];
  field: 'benchmark' | 'compare_city';
}

const AddComparisonModal = (props: Props) => {
  const {closeModal, data, field} = props;
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const {data: globalData} = useGlobalLocationData();
  const history = useHistory();
  const { compare_city, benchmark, ...otherParams } = useQueryParams();
  const {data: counts} = useQuery<SuccessResponse, {cityId: number}>(PEER_GROUP_CITY_COUNT, {
    variables: {
      cityId: cityId !== null ? parseInt(cityId, 10) : 0,
  } });
  let intialSelected: Datum | null | RegionGroup | PeerGroup = PeerGroup.GlobalPopulation;
  if (field === 'benchmark' && benchmark) {
    if (isValidPeerGroup(benchmark)) {
      intialSelected = benchmark as PeerGroup;
    }
  } else if (field === 'compare_city' && compare_city) {
    if (compare_city === RegionGroup.World || isValidPeerGroup(compare_city)) {
      intialSelected = compare_city as RegionGroup || PeerGroup;
    }
  }
  const [selected, setSelected] = useState<Datum | null | RegionGroup | PeerGroup>(intialSelected);

  const currentCity = globalData ? globalData.cities.find(c => c.cityId === cityId) : undefined;
  const name = currentCity ? currentCity.name : '';

  const selectCity = (city: Datum | null) => {
    setSelected(city);
    if (continueButtonRef && continueButtonRef.current) {
      const node = continueButtonRef.current;
      setTimeout(() => {
        node.focus();
      }, 0);
    }
  };

  const onContinue = () => {
    if (selected && typeof selected === 'object') {
      const query = queryString.stringify({...otherParams, compare_city, benchmark, [field]: selected.id});
      const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
      history.push(newUrl);
      closeModal(selected.id.toString());
    } else if (typeof selected === 'string') {
      const query = queryString.stringify({...otherParams, compare_city, benchmark, [field]: selected});
      const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
      history.push(newUrl);
      closeModal(RegionGroup.World);
    }
  };

  const prevValue = field === 'benchmark' ? benchmark : compare_city;
  const closeModalWithoutConfirming = prevValue === undefined && field === 'benchmark'
    ? undefined
    : () => closeModal(prevValue);

  const worldOption = field === 'compare_city' ? (
    <GroupsList>
      <GroupItem>
        <GroupRadio
          onClick={() => setSelected(RegionGroup.World)}
          $checked={selected === RegionGroup.World}
        >
          {getString('global-text-world')}
        </GroupRadio>
      </GroupItem>
    </GroupsList>
  ) : null;

  const title = field === 'benchmark'
    ? getString('global-ui-benchmark-title')
    : getString('global-ui-compare-title', {name});

  const selectPeerTitle = field === 'benchmark'
    ? getString('global-ui-select-benchmark-group')
    : getString('global-ui-select-peer-group');

  const selectCityTitle = field === 'benchmark'
    ? getString('global-ui-select-benchmark-city')
    : getString('global-ui-select-a-city-name');

  const about = field === 'benchmark'
    ? (
      <Switch>
        <Route path={CityRoutes.CityGrowthOpportunities} render={() => (
          <AboutText
            dangerouslySetInnerHTML={{__html: getString('global-ui-benchmark-about-alt-1')}}
          />
        )} />
        <Route render={() => (
          <AboutText
            dangerouslySetInnerHTML={{__html: getString('global-ui-benchmark-about')}}
          />
        )} />
      </Switch>
    ) : null;

  const getCount = (f: PeerGroupCountFields) => {
    if (counts && counts.cityPeerGroupCounts) {
      return counts.cityPeerGroupCounts[f]
        ? <small>({counts.cityPeerGroupCounts[f]} cities)</small> : <small>(0 cities)</small>;
    }
    return null;
  };

  return (
    <BasicModal onClose={closeModalWithoutConfirming} width={'auto'} height={'inherit'}>
      <Root>
        <H1 style={field === 'compare_city' ? {marginBottom: '4rem'} : undefined}>
          {title}:
        </H1>
        {about}
        <SearchContainerDark>
          <Grid>
          <div>
            <LabelUnderline>{selectPeerTitle}</LabelUnderline>
            {worldOption}
            <GlobalVRegionalGrid>
              <div>
                <ContainerTitle>{getString('global-text-global-peers')}</ContainerTitle>
                <GroupContainer>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.GlobalPopulation)}
                        $checked={selected === PeerGroup.GlobalPopulation}
                      >
                        <div>
                          {getString('global-text-similar-population')}
                          <br />
                          {getCount(PeerGroupCountFields.globalPop)}
                          <br />
                          <Recommended>
                            *{getString('global-ui-recommended')}
                          </Recommended>
                        </div>
                      </GroupRadio>
                    </GroupItem>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.GlobalIncome)}
                        $checked={selected === PeerGroup.GlobalIncome}
                      >
                        <div>
                          {getString('global-text-similar-income')}
                          <br />
                          {getCount(PeerGroupCountFields.globalIncome)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.GlobalEuclideanDistance)}
                        $checked={selected === PeerGroup.GlobalEuclideanDistance}
                      >
                        <div>
                          {getString('global-text-similar-proximity')}
                          <br />
                          {getCount(PeerGroupCountFields.globalEucdist)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                  </GroupContainer>
                </div>
                <div>
                <ContainerTitle>{getString('global-text-regional-peers')}</ContainerTitle>
                  <GroupContainer>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.RegionalPopulation)}
                        $checked={selected === PeerGroup.RegionalPopulation}
                      >
                        <div>
                          {getString('global-text-similar-population')}
                          <br />
                          {getCount(PeerGroupCountFields.regionalPop)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.RegionalIncome)}
                        $checked={selected === PeerGroup.RegionalIncome}
                      >
                        <div>
                          {getString('global-text-similar-income')}
                          <br />
                          {getCount(PeerGroupCountFields.regionalIncome)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.RegionalEuclideanDistance)}
                        $checked={selected === PeerGroup.RegionalEuclideanDistance}
                      >
                        <div>
                          {getString('global-text-similar-proximity')}
                          <br />
                          {getCount(PeerGroupCountFields.regionalEucdist)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                    <GroupItem>
                      <GroupRadio
                        onClick={() => setSelected(PeerGroup.Region)}
                        $checked={selected === PeerGroup.Region}
                      >
                        <div>
                          {getString('global-text-all-regional-peers')}
                          <br />
                          {getCount(PeerGroupCountFields.region)}
                        </div>
                      </GroupRadio>
                    </GroupItem>
                  </GroupContainer>
                </div>
              </GlobalVRegionalGrid>
            </div>
            <Or>{getString('global-ui-or')}</Or>
            <div>
              <Label>{selectCityTitle}</Label>
              <PanelSearch
                data={data.filter(({id}) => id !== cityId)}
                topLevelTitle={getString('global-text-countries')}
                disallowSelectionLevels={['0']}
                defaultPlaceholderText={getString('global-ui-type-a-city-name')}
                showCount={true}
                resultsIdentation={1.75}
                neverEmpty={false}
                maxResults={500}
                selectedValue={typeof selected === 'object' ? selected : null}
                onSelect={selectCity}
                focusOnRender={window.innerHeight > 800}
                matchingKeywordFormatter={matchingKeywordFormatter(TooltipTheme.Dark)}
              />
            </div>
          </Grid>
        </SearchContainerDark>
        <ContinueButtonContainer>
          <ContinueButton
            onClick={onContinue}
            ref={continueButtonRef}
            disabled={!selected}
          >
            {getString('global-ui-continue')}
          </ContinueButton>
        </ContinueButtonContainer>
      </Root>
    </BasicModal>
  );
};

export default AddComparisonModal;
