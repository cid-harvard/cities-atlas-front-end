import React from 'react';
import Header from '../navigation/header';
import {
  Root as RootBase,
  ContentContainer,
} from '../../styling/GlobalGrid';
import styled from 'styled-components/macro';

const Root = styled(RootBase)`
  pointer-events: none;
`;

interface Props {
  children: React.ReactNode;
}

const InformationalPage = (props: Props) => {
  const {
    children,
  } = props;
  return (
    <Root>
      <Header />
      <ContentContainer>
        {children}
      </ContentContainer>
    </Root>
  );
};

export default InformationalPage;
