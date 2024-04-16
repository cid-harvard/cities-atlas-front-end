import React from "react";
import styled, { keyframes } from "styled-components/macro";

const baseSize = 30; // in px

const Ring = styled.div<{ size: number | undefined }>`
  display: inline-block;
  position: relative;
  width: ${({ size }) => (size ? size : baseSize)}px;
  height: ${({ size }) => (size ? size : baseSize)}px;
  margin-right: 0.6rem;
`;
const animation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const ChildBase = styled.div<{
  themeColor: string | undefined;
  size: number | undefined;
}>`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: ${({ size }) => (size ? size * 0.8 : baseSize * 0.8)}px;
  height: ${({ size }) => (size ? size * 0.8 : baseSize * 0.8)}px;
  margin: ${({ size }) => (size ? size * 0.1 : baseSize * 0.1)}px;
  border: ${({ size }) => (size ? size * 0.1 : baseSize * 0.1)}px solid
    ${({ themeColor }) => (themeColor ? themeColor : "#bebebe")};
  border-radius: 50%;
  animation: ${animation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: ${({ themeColor }) => (themeColor ? themeColor : "#bebebe")}
    transparent transparent transparent;
`;

const FirstChild = styled(ChildBase)`
  animation-delay: -0.45s;
`;
const SecondChild = styled(ChildBase)`
  animation-delay: -0.3s;
`;
const ThirdChild = styled(ChildBase)`
  animation-delay: -0.15s;
`;

interface Props {
  color?: string;
  size?: number; // in px
}

const SimpleLoader = (props: Props) => {
  const { color, size } = props;
  return (
    <Ring size={size}>
      <FirstChild themeColor={color} size={size}></FirstChild>
      <SecondChild themeColor={color} size={size}></SecondChild>
      <ThirdChild themeColor={color} size={size}></ThirdChild>
      <ChildBase themeColor={color} size={size}></ChildBase>
    </Ring>
  );
};

export default SimpleLoader;
