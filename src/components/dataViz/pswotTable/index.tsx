import React from 'react';
import useGlobalIndustriesData from '../../../hooks/useGlobalIndustriesData';
import useRCAData from '../../../hooks/useRCAData';
import {
  DigitLevel,
  CompositionType,
  defaultCompositionType,
} from '../../../types/graphQL/graphQLTypes';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import ScrollContainer from 'react-indiana-drag-scroll';
import styled from 'styled-components/macro';
import TableRow from './TableRow';
import {
  lightBorderColor,
} from '../../../styling/styleUtils';

const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const ScrollRoot = styled(ScrollContainer)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  cursor: move;
`;

const Table = styled.table`
  border-collapse: collapse;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: #fff;
  padding: 0.5rem;

  &:before {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    border-bottom: solid 1px ${lightBorderColor};
    width: 100%;
    display: block;
  }
`;

const NameTh = styled(Th)`
  left: 0;
  z-index: 30;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    border-right: solid 1px ${lightBorderColor};
    width: 0;
    display: block;
  }
`;

enum Quadrant {
  Potential = 'Potential',
  Strength = 'Strength',
  Weakness = 'Weakness',
  Opportunity = 'Opportunity',
  Threat = 'Threat',
}

const getQuadrant = (rca: number, density: number): Quadrant => {
  if (rca === 0) {
    return Quadrant.Potential;
  } if (rca > 1) {
    if (density > 0) {
      return Quadrant.Strength;
    } else {
      return Quadrant.Threat;
    }
  } else {
    if (density > 0) {
      return Quadrant.Opportunity;
    } else {
      return Quadrant.Weakness;
    }
  }
};

interface Props {
  digitLevel: DigitLevel;
  compositionType: CompositionType;
}

const PSWOTTable = (props: Props) => {
  const {
    digitLevel, compositionType,
  } = props;
  const {loading, error, data} = useRCAData(digitLevel);
  const industries = useGlobalIndustriesData();

  let output: React.ReactElement<any> | null;
  if (industries.loading || loading) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (industries.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (data !== undefined && industries && industries.data) {
    const {naicsRca, naicsData} = data;
    const industryRows = industries.data.industries
      .filter(d => d.level === digitLevel)
      .map(d => {
        const rcaDatum = naicsRca.find(dd => dd.naicsId !== null && dd.naicsId.toString() === d.naicsId);
        const densityDatum = naicsData.find(dd => dd.naicsId !== null && dd.naicsId.toString() === d.naicsId);
        let densityKey: 'densityCompany' | 'densityEmploy';
        if (compositionType === CompositionType.Companies ||
            (!compositionType && defaultCompositionType === CompositionType.Companies)) {
          densityKey = 'densityCompany';
        } else {
          densityKey = 'densityEmploy';
        }
        const density = densityDatum && densityDatum[densityKey] !== null ? densityDatum[densityKey] as number : 0;
        const rca = rcaDatum && rcaDatum.rca ? rcaDatum.rca : 0;
        const quadrant = getQuadrant(rca, density);
        return (
          <TableRow
            key={'table-row-' + d.naicsId}
            name={d.name ? d.name : ''}
            density={density}
            rca={rca}
            quadrant={quadrant}
          />
        );
      });

    output = (
      <Table>
        <thead>
          <tr>
            <NameTh>Name</NameTh>
            <Th>Specialization ({compositionType})</Th>
            <Th>Density ({compositionType})</Th>
            <Th>Assigned category</Th>
          </tr>
        </thead>
        <tbody>
          {industryRows}
        </tbody>
      </Table>
    );
  } else {
    output = null;
  }


  return (
    <Root>
      <ScrollRoot hideScrollbars={false}>
        {output}
      </ScrollRoot>
    </Root>
  );
};

export default PSWOTTable;
