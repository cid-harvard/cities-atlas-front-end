import React from "react";
import styled, { keyframes } from "styled-components/macro";
import { backgroundDark } from "../../styling/styleUtils";
import { breakPoints } from "../../styling/GlobalGrid";

const Root = styled.div`
  grid-column: 2;
  grid-row: 2;
  max-height: 100%;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 1;
    grid-column: 1;
  }
`;

const ScrollContainer = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: center;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
  }

  @media ${breakPoints.small} {
    position: static;
    overflow: visible;
  }
`;

const ContentContainer = styled.div`
  padding-left: 0.75rem;
  border-left: solid 2px ${backgroundDark};
  width: 100%;
  margin: auto;

  @media ${breakPoints.small} {
    padding-left: 0;
    border-left: none;
  }
`;
const flickerAnimation = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.5; }
  100% { opacity: 1; }
`;

const TitleBar = styled.div`
  height: 1.5rem;
  background-color: #efefef;
  margin-bottom: 0.4rem;
  animation: ${flickerAnimation} 1s infinite;
`;

const ParaBar = styled.div`
  height: 0.845rem;
  background-color: #efefef;
  margin-bottom: 0.35rem;
  animation: ${flickerAnimation} 1s infinite;
`;

const StandardSideTextLoading = ({
  clearStyles,
}: {
  clearStyles?: boolean;
}) => {
  const Content = clearStyles ? React.Fragment : ContentContainer;
  return (
    <Root>
      <ScrollContainer
        style={{ alignItems: clearStyles ? "flex-start" : undefined }}
      >
        <Content>
          <TitleBar style={{ width: "95%" }} />
          <TitleBar style={{ width: "60%", marginBottom: "1rem" }} />
          <ParaBar style={{ width: "93%" }} />
          <ParaBar style={{ width: "87%" }} />
          <ParaBar style={{ width: "76%" }} />
          <ParaBar style={{ width: "90%" }} />
          <ParaBar style={{ width: "84%" }} />
          <ParaBar style={{ width: "76%" }} />
          <ParaBar style={{ width: "59%" }} />
        </Content>
      </ScrollContainer>
    </Root>
  );
};

export default StandardSideTextLoading;
