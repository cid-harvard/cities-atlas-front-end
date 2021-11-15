import React, {useState} from 'react';
import AddComparisonModal, {ComparisonType} from './AddComparisonModal';
import {RegionGroup} from '../../../dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import {
  baseColor,
  errorColor,
  medGray,
} from '../../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {Datum} from 'react-panel-search';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import useQueryParams from '../../../../hooks/useQueryParams';
import {isValidPeerGroup} from '../../../../types/graphQL/graphQLTypes';
import {useHistory} from 'react-router-dom';
import {Routes} from '../../../../routing/routes';
import {joyrideClassNames} from '../../../navigation/secondaryHeader/guide/CitiesGuide';

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const ButtonBase = styled.button`
  height: 100%;
  text-transform: uppercase;
  position: relative;
  background-color: transparent;
`;

const AddComparisonButton = styled(ButtonBase)`
  font-size: 0.8rem;
  border: none;
  padding: 0 0.5rem 0 1.45rem;
  color: #fff;
  background-color: ${medGray};
  outline: none;
  max-width: min-content;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  div {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:before {
    font-size: 1.45rem;
    content: '⇅';
    left: 0.15rem;
    position: absolute;
  }

  &:hover, &:focus {
    background-color: ${baseColor};
  }

  &:active {
    color: #fff;
  }
`;

const ErrorNote = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${errorColor};
  font-size: 0.65rem;
  padding: 0 0.25rem;
  max-width: 12rem;
  text-transform: uppercase;
  cursor: pointer;
`;

interface Props {
  data: Datum[];
}

const ComparisonSelection = (props: Props) => {
  const {data} = props;
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const { benchmark } = useQueryParams();
  const [modalOpen, setModalOpen] = useState<boolean>(benchmark === undefined);
  const {location} = useHistory();

  const openBenchmarkModal = () => setModalOpen(true);

  let benchkmarkDropdown: React.ReactElement<any>;
  if (benchmark === undefined) {
    benchkmarkDropdown = (
      <div>
        <AddComparisonButton onClick={openBenchmarkModal}>
          {getString('global-ui-add-benchmark')}
        </AddComparisonButton>
      </div>
    );
  } else {
    const comparisonData: Datum[] = [
      {id: RegionGroup.World, title: getString('global-text-world'), level: null, parent_id: null},
      ...data.filter(({id}) => id !== cityId),
    ];
    const selectedValue = comparisonData.find(({id}) => id === benchmark);
    let benchmarkName = selectedValue ? selectedValue.title : '---';
    if (isValidPeerGroup(benchmark)) {
      benchmarkName = getString('global-formatted-peer-groups', {type: benchmark});
    }

    const error =
      location.pathname.includes(Routes.CityGrowthOpportunities.replace('/city/:cityId/', '')) && selectedValue
      ? (
        <ErrorNote onClick={openBenchmarkModal}>
          {getString('global-ui-city-city-benchmark-warning')}
        </ErrorNote>
      ) : null;


    benchkmarkDropdown = (
      <>
        <Grid>
          <AddComparisonButton
            onClick={openBenchmarkModal}
            className={joyrideClassNames.benchmarkSelection}
          >
            <div>{getString('global-benchmarked-by')}:</div>
            <div>{benchmarkName}</div>
          </AddComparisonButton>
          {error}
        </Grid>
      </>
    );
  }

  const closeModal = (newBenchmark: string | undefined) => {
    if (newBenchmark !== undefined) {
      setModalOpen(false);
    }
  };
  const benchkmarkModal = modalOpen ? (
    <AddComparisonModal
      closeModal={closeModal}
      data={data}
      comparisonType={ComparisonType.Relative}
    />
  ) : null;

  return (
    <>
      {benchkmarkDropdown}
      {benchkmarkModal}
    </>
  );

};

export default ComparisonSelection;