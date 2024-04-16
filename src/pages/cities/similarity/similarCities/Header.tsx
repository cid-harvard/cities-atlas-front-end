import React from "react";
import styled from "styled-components";
import useCurrentCity from "../../../../hooks/useCurrentCity";
import SimpleTextLoading from "../../../../components/transitionStateComponents/SimpleTextLoading";
import useFluent from "../../../../hooks/useFluent";

const Root = styled.div`
  grid-column: 1 / -1;
`;

const H1 = styled.h1`
  margin-top: 0;
`;

const Header = () => {
  const { loading, city } = useCurrentCity();
  const getString = useFluent();
  if (loading) {
    return (
      <Root>
        <H1>
          <SimpleTextLoading />
        </H1>
      </Root>
    );
  } else {
    return (
      <Root>
        <H1>{getString("city-similarity-title", { name: city?.name })}</H1>
      </Root>
    );
  }
};

export default Header;
