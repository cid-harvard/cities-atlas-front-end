import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

export const borderColor = "#999";

const LargeTerm = styled.dt`
  font-size: 1.5rem;
  line-height: 1.14;
  color: rgb(51, 51, 51);
  border-top: 1px solid ${borderColor};
  background-color: rgba(90, 111, 140, 0.1);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: rgba(90, 111, 140, 0.35);
    cursor: pointer;
  }
`;
const SmallTerm = styled(LargeTerm)`
  font-size: 1rem;
  padding: 0.75rem;
  line-height: 0.75rem;
`;

const Definition = styled.dd`
  transition: height 200ms ease-in-out;
  overflow: hidden;
  box-sizing: border-box;
  margin-left: 0;

  a {
    color: rgb(39, 86, 197);

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Paragraph = styled.p`
  padding: 1rem;
  border-top: 1px solid ${borderColor};
`;

const Icon = styled.div`
  font-size: 2rem;
`;

export interface IProps {
  term: string;
  definition: string;
  smallLabel?: boolean;
}

const GlossaryItem = (props: IProps) => {
  const { term, definition, smallLabel } = props;

  const [domElmHeight, setDomElmHeight] = useState<number>(0);
  const [expandedHeight, setExpandedHeight] = useState<"auto" | number>("auto");
  const [icon, setIcon] = useState<"+" | "-">("+");
  const definitionElm = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const node = definitionElm.current;
    if (node !== null) {
      setDomElmHeight(node.clientHeight);
      setExpandedHeight(0);
    }
  }, [definitionElm]);

  const toggleDefinition = () => {
    if (expandedHeight === 0) {
      setExpandedHeight(domElmHeight);
      setIcon("-");
    } else {
      setExpandedHeight(0);
      setIcon("+");
    }
  };

  const Term = smallLabel === true ? SmallTerm : LargeTerm;

  return (
    <>
      <Term onClick={toggleDefinition}>
        {term}
        <Icon>{icon}</Icon>
      </Term>
      <Definition ref={definitionElm} style={{ height: expandedHeight }}>
        <Paragraph dangerouslySetInnerHTML={{ __html: definition }} />
      </Definition>
    </>
  );
};

export default GlossaryItem;
