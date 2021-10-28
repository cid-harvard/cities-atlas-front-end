import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  grid-column: 1;
  background-color: gray;
  position: relative;
`;

const Content = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  `;

  const ScrollContainer = styled.div`
  height: 100%;
  overflow: auto;
  background-color: darkgray;
`;

const InnerConent = styled.div`

`;

const FilterBar = () => {
  return (
    <Root>
      <Content>
        <ScrollContainer>
          <InnerConent>
            FilterBar
          </InnerConent>
        </ScrollContainer>
      </Content>
    </Root>
  );
};

export default FilterBar;
