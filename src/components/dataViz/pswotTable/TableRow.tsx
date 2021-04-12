import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
} from '../../../styling/styleUtils';

const Td = styled.td`
  padding: 0.5rem;
  vertical-align: center;
  text-align: center;
`;

const NameTd = styled(Td)`
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: #fff;
  text-align: left;

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

export interface Props {
  id: string;
  name: string;
  rca: number;
  density: number;
  quadrant: string;
}

const TableRow = (props: Props) => {
  const {
    name, rca, density, quadrant,
  } = props;
  return (
    <tr>
      <NameTd>{name}</NameTd>
      <Td>{rca}</Td>
      <Td>{density}</Td>
      <Td>{quadrant}</Td>
    </tr>
  );
};

export default TableRow;
