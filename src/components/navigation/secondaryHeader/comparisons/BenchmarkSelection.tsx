import React, {useState} from 'react';
import AddComparisonModal from './AddComparisonModal';
import {RegionGroup} from '../../../dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import {
  baseColor,
} from '../../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {Datum} from 'react-panel-search';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import useQueryParams from '../../../../hooks/useQueryParams';
import {PeerGroup} from '../../../../types/graphQL/graphQLTypes';

const ButtonBase = styled.button`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  text-transform: uppercase;
  position: relative;
`;

const AddComparisonButton = styled(ButtonBase)`
  font-size: 0.8rem;
  border: none;
  padding: 0.4rem 0.5rem 0.4rem 1.45rem;
  color: ${baseColor};
  outline: none;

  &:before {
    font-size: 1.45rem;
    content: '⇅';
    left: 0.15rem;
    position: absolute;
  }

  &:hover, &:focus {
    background-color: #fff;
  }

  &:active {
    color: ${baseColor};
  }
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
    if (benchmark === PeerGroup.GlobalIncome || benchmark === PeerGroup.GlobalPopulation ||
        benchmark === PeerGroup.RegionalIncome || benchmark === PeerGroup.RegionalPopulation) {
      benchmarkName = getString('global-formatted-peer-groups', {type: benchmark});
    }
    benchkmarkDropdown = (
      <>
        <div>
          <AddComparisonButton onClick={openBenchmarkModal}>
            benchmark: {benchmarkName}
          </AddComparisonButton>
        </div>
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
      field={'benchmark'}
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