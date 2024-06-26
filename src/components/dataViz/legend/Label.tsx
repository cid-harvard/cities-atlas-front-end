import React, { useState } from "react";
import styled from "styled-components/macro";
import {
  primaryFont,
  fadeInAnimation,
  backgroundDark,
  secondaryFont,
  noOutlineOnFocus,
  radioButtonCss,
} from "../../../styling/styleUtils";
import { rgba } from "polished";
import useFluent from "../../../hooks/useFluent";

const Root = styled.div`
  position: relative;
  font-family: ${primaryFont};
  z-index: 40;
`;
const Button = styled.button`
  display: flex;
  align-items: center;
  margin: 0.1rem;
  text-transform: uppercase;
  font-size: 0.65rem;
  font-size: clamp(0.5rem, 0.75vw, 0.75rem);
  font-family: ${primaryFont};
  background-color: #fff;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 1;
  flex-grow: 0;
  flex-basis: 1;
  width: min-content;
  height: 28px;
  white-space: pre-wrap;
  ${noOutlineOnFocus}
`;

const Block = styled.div<{ $checked: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  width: clamp(0.5rem, 1vw, 1.2rem);
  height: clamp(0.5rem, 1vw, 1.2rem);
  margin-right: 0.2rem;
  position: relative;
  flex-shrink: 0;

  &:after {
    ${({ $checked }) => ($checked ? "content: '';" : "")}
    width: 0.1rem;
    border-radius: 80px;
    height: 180%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    transform: rotate(45deg);
    background-color: #333;
  }
`;

const HideIsolateRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: translate(0, -100%);
  pointer-events: none;
  display: flex;
  justify-content: center;
  ${fadeInAnimation}
`;

const HideIsolateContent = styled.div`
  pointer-events: all;
  margin: auto;
  position: relative;
`;

const HideIsolateText = styled.div`
  border-radius: 4px;
  padding: 9px 14px;
  background-color: ${backgroundDark};
  color: #fff;
  border-radius: 4px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
`;

const ArrowContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
`;

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  border-top: 0.5rem solid ${backgroundDark};
  position: relative;
  top: -2px;
`;

const Title = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
`;

const Hr = styled.hr`
  max-width: 5rem;
  border-top: solid 2px;
`;

const CloseButton = styled.button`
  border: none;
  padding: 0.2rem;
  background-color: transparent;
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
const HideIsolateButton = styled.button`
  margin: 8px;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  color: #fff;
  background-color: transparent;
  border: none;
  white-space: nowrap;
  ${noOutlineOnFocus}
  ${radioButtonCss}

  &:hover {
    background-color: #fff;
    color: ${backgroundDark};
  }
`;

export interface CategoryDatum {
  id: string;
  color: string;
  name: string;
}

interface Props {
  category: CategoryDatum;
  toggleCategory?: () => void;
  isolateCategory?: () => void;
  isHidden: boolean;
  isIsolated: boolean;
}

const Label = ({
  category: { color, name },
  toggleCategory,
  isolateCategory,
  isHidden,
  isIsolated,
}: Props) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const getString = useFluent();
  const toggleButton = toggleCategory ? (
    <HideIsolateButton $checked={isHidden} onClick={toggleCategory}>
      {getString("global-ui-hide")}
    </HideIsolateButton>
  ) : null;
  const isolateButton = isolateCategory ? (
    <HideIsolateButton $checked={isIsolated} onClick={isolateCategory}>
      {getString("global-ui-keep-only")}
    </HideIsolateButton>
  ) : null;
  const hideIsolateButtons =
    isolateButton || toggleButton ? (
      <ButtonWrapper>
        {toggleButton}
        {isolateButton}
      </ButtonWrapper>
    ) : null;
  const hideIsolate = isHovered ? (
    <HideIsolateRoot>
      <HideIsolateContent>
        <HideIsolateText>
          <Title>{name}</Title>
          <Hr style={{ borderColor: color }} />
          {hideIsolateButtons}
        </HideIsolateText>
        <ArrowContainer>
          <Arrow />
        </ArrowContainer>
        <CloseButton onClick={() => setIsHovered(false)}>×</CloseButton>
      </HideIsolateContent>
    </HideIsolateRoot>
  ) : null;
  return (
    <Root
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: isHovered ? 150 : undefined }}
    >
      <Button
        style={{
          backgroundColor: isHovered ? rgba(color, 0.3) : undefined,
          opacity: isHidden ? 0.5 : undefined,
        }}
        onClick={toggleCategory}
      >
        <Block style={{ backgroundColor: color }} $checked={isHidden} />
        {name}
      </Button>
      {hideIsolate}
    </Root>
  );
};

export default Label;
