import React from 'react';
import styled from 'styled-components';
import { lightBorderColor } from '../../../../styling/styleUtils';

const Root = styled.div`
  grid-column: 1;
  position: relative;
`;

const Content = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1rem 1rem 1rem 0;
  box-sizing: border-box;
  `;

  const ScrollContainer = styled.div`
  height: 100%;
  overflow: auto;
  background-color: ${lightBorderColor};
`;

const InnerConent = styled.div`

`;

const FilterBar = () => {
  return (
    <Root>
      <Content>
        <ScrollContainer>
          <InnerConent>
          </InnerConent>
        </ScrollContainer>
      </Content>
    </Root>
  );
};

export default FilterBar;
