import React from 'react';
import styled from 'styled-components';
import useCurrentCity from '../../../../hooks/useCurrentCity';
import SimpleTextLoading from '../../../../components/transitionStateComponents/SimpleTextLoading';
import useFluent from '../../../../hooks/useFluent';

const Root = styled.div`
  grid-column: 1 / -1;
`;

const Header = () => {
  const {loading, city} = useCurrentCity();
  const getString = useFluent();
  if (loading) {
    return (
      <Root>
        <h1><SimpleTextLoading /></h1>
      </Root>
    );
  } else {
    return (
      <Root>
        <h1>{city?.name} {getString('global-text-similar-cities')}</h1>
      </Root>
    );
  }

};

export default Header;
