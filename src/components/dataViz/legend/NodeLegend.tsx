import React from "react";
import styled from "styled-components/macro";
import { baseColor, lightBaseColor } from "../../../styling/styleUtils";
import { lowIntensityNodeColor } from "../../dataViz/industrySpace/chart/useLayoutData";

const Root = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0.875rem 0;
  position: sticky;
  left: 0;
  bottom: -1px;
  background-color: #fff;
  z-index: 100;
  border-top: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  align-items: center;
  font-size: 0.55rem;
  font-size: clamp(0.55rem, 0.95vw, 0.65rem);
  grid-column-gap: 1rem;
  grid-row-gap: 0.5rem;
  box-shadow: 0px -4px 3px 0px rgba(255, 255, 255, 1);
`;

const ColumnBase = styled.div`
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  grid-column-gap: 0.2rem;
  align-items: center;
`;

const LeftColumn = styled(ColumnBase)`
  grid-column: 1;
`;
const RightColumn = styled(ColumnBase)`
  grid-column: 2;
`;

const Title = styled.h3`
  font-weight: 400;
  font-size: 0.65rem;
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: ${baseColor};
  grid-column: 1 / -1;
  margin: 0;
  font-weight: 600;
`;

const NodeBase = styled.div`
  border-radius: 5000px;
  background-color: ${lightBaseColor};
  border: solid 1px ${lightBaseColor};
  margin: auto;
  flex-shrink: 0;
`;

const NodeSmall = styled(NodeBase)`
  width: 0.25rem;
  height: 0.25rem;
`;
const NodeMedium = styled(NodeBase)`
  width: 0.5rem;
  height: 0.5rem;
`;
const NodeBlank = styled(NodeMedium)`
  background-color: ${lowIntensityNodeColor};
  border-color: ${lowIntensityNodeColor};
`;
const NodeLarge = styled(NodeBase)`
  width: 1rem;
  height: 1rem;
`;

interface Props {
  sizeBy: null | {
    title: string;
    minLabel: string;
    maxLabel: string;
  };
  colorBy: null | {
    coloredLabel: string;
    greyLabel: string;
  };
}

const NodeLegend = (props: Props) => {
  const sizeBy = props.sizeBy ? (
    <>
      <LeftColumn style={{ gridRow: 1 }}>
        <Title>{props.sizeBy.title}</Title>
      </LeftColumn>
      <LeftColumn style={{ gridRow: 2 }}>
        <NodeLarge /> <div>{props.sizeBy.maxLabel}</div>
      </LeftColumn>
      <LeftColumn style={{ gridRow: 3 }}>
        <NodeSmall /> <div>{props.sizeBy.minLabel}</div>
      </LeftColumn>
    </>
  ) : null;

  const colorBy = props.colorBy ? (
    <>
      <RightColumn style={{ gridRow: 1 }}>
        <Title>Node Colors</Title>
      </RightColumn>
      <RightColumn style={{ gridRow: 2 }}>
        <NodeMedium />
        <div>
          <div>Colored Nodes:</div>
          <div>{props.colorBy.coloredLabel}</div>
        </div>
      </RightColumn>
      <RightColumn style={{ gridRow: 3 }}>
        <NodeBlank />
        <div>
          <div>Grey Nodes:</div>
          <div>{props.colorBy.greyLabel}</div>
        </div>
      </RightColumn>
    </>
  ) : null;
  return (
    <Root>
      {sizeBy}
      {colorBy}
    </Root>
  );
};

export default NodeLegend;
