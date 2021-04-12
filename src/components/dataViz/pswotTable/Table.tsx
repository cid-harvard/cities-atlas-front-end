import React from 'react';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import ScrollContainer from 'react-indiana-drag-scroll';
import styled from 'styled-components/macro';
import TableRow, {Props as RowDatum} from './TableRow';
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

export const getQuadrant = (rca: number, density: number): Quadrant => {
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
  loading: boolean;
  error: any | undefined;
  data: RowDatum[] | undefined;
  compositionType: CompositionType;
}

const PSWOTTable = (props: Props) => {
  const {
    loading, error, data, compositionType,
  } = props;
  let output: React.ReactElement<any> | null;
  if (loading) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (data !== undefined) {
    const rows = data.map(d => {
        return (
          <TableRow
            key={'table-row-' + d.id}
            id={d.id}
            name={d.name}
            density={d.density}
            rca={d.rca}
            quadrant={d.quadrant}
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
          {rows}
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
