import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  grid-column: 1 / -1;
  background-color: salmon;
`;

const Header = () => {
  return (
    <Root>
      <h1>Header</h1>
    </Root>
  );
};

export default Header;
