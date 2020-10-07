import React from 'react';
import styled from 'styled-components/macro';
import {backgroundDark} from '../../styling/styleUtils';
import {breakPoints} from '../../styling/GlobalGrid';

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
  overflow: auto;
  display: flex;
  align-items: center;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, .1);
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

const StandardSideTextBlock = ({children}: {children: React.ReactNode}) => {
  return (
    <Root>
      <ScrollContainer>
        <ContentContainer>
          {children}
        </ContentContainer>
      </ScrollContainer>
    </Root>
  );
};

export default StandardSideTextBlock;
