import React from 'react';
import styled from 'styled-components/macro';
import {backgroundDark} from '../../styling/styleUtils';

const Root = styled.div`
  grid-column: 2;
  grid-row: 2;
  max-height: 100%;
  display: flex;
  align-items: center;
`;

const ContentContainer = styled.div`
  padding-left: 0.75rem;
  border-left: solid 2px ${backgroundDark};
`;

const StandardSideTextBlock = ({children}: {children: React.ReactNode}) => {
  return (
    <Root>
      <ContentContainer>
        {children}
      </ContentContainer>
    </Root>
  );
};

export default StandardSideTextBlock;
