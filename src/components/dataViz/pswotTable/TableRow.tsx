import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
} from '../../../styling/styleUtils';

const hoverBackgroundColor = '#efefef';

const Tr = styled.tr`
  &:hover {
    background-color: ${hoverBackgroundColor};
  }
`;

const Td = styled.td`
  padding: 0.5rem;
  vertical-align: center;
  font-size: 0.8rem;

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

const NameTd = styled(Td)`
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: #fff;
  display: flex;

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

const ContentTd = styled(Td)`
  text-align: center;
  position: relative;
`;

const ColorBar = styled.div`
  flex-shrink: 0;
  width: 0.4rem;
  margin: -0.2rem 0.75rem -0.2rem 0;
`;

export interface Props {
  id: string;
  name: string;
  rca: number;
  density: number;
  quadrant: string;
  color: string;
}

const TableRow = (props: Props) => {
  const {
    name, rca, density, quadrant, color,
  } = props;

  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <Tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NameTd style={hovered ? {backgroundColor: hoverBackgroundColor} : undefined}>
        <ColorBar style={{backgroundColor: color}} />
        {name}
      </NameTd>
      <ContentTd>{rca}</ContentTd>
      <ContentTd>{density}</ContentTd>
      <ContentTd>{quadrant}</ContentTd>
    </Tr>
  );
};

export default TableRow;
