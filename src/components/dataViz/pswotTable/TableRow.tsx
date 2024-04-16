import React, { useState } from "react";
import styled from "styled-components/macro";
import {
  lightBorderColor,
  primaryColorLight,
} from "../../../styling/styleUtils";

export const highlightedIdName = "react-comparison-bar-chart-highlighted-item";

const hoverBackgroundColor = "#efefef";

const Tr = styled.tr`
  height: initial;

  &:hover {
    background-color: ${hoverBackgroundColor};
  }
`;

const Td = styled.td`
  padding: 0.5rem;
  vertical-align: middle;
  font-size: 0.8rem;

  &:before {
    content: "";
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

  &:after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    border-right: solid 1px ${lightBorderColor};
    width: 0;
    display: block;
  }
`;

const NameContent = styled.div`
  display: flex;
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

export interface RowDatum {
  id: string;
  name: string;
  rca: number;
  density: number;
  quadrant: string;
  color: string;
}

interface Props extends RowDatum {
  highlighted: string | undefined;
}

const TableRow = (props: Props) => {
  const { id, name, rca, density, quadrant, color, highlighted } = props;

  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <Tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={highlighted === id ? highlightedIdName : undefined}
      style={
        highlighted === id ? { backgroundColor: primaryColorLight } : undefined
      }
    >
      <NameTd
        style={
          hovered && highlighted !== id
            ? { backgroundColor: hoverBackgroundColor }
            : highlighted === id
              ? { backgroundColor: primaryColorLight }
              : undefined
        }
      >
        <NameContent>
          <ColorBar style={{ backgroundColor: color }} />
          {name}
        </NameContent>
      </NameTd>
      <ContentTd>{rca}</ContentTd>
      <ContentTd>{density}</ContentTd>
      <ContentTd>{quadrant}</ContentTd>
    </Tr>
  );
};

export default TableRow;
