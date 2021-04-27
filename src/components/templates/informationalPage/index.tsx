import React from 'react';
import Header from '../../navigation/header';
import {
  InformationalPageRoot as RootBase,
  ContentContainer,
  breakPoints,
} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import Footer from './Footer';

export const rootId = 'infromational-page-root-scroll-id';

const Root = styled(RootBase)`
  overflow: auto;
`;

const Content = styled(ContentContainer)`
  display: grid;
  padding: 1rem;
  grid-template-columns: auto 15rem;
  grid-column-gap: 5rem;
  max-width: 950px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  position: relative;

  @media (max-width: 760px) {
    grid-template-columns: auto 8rem;
    grid-column-gap: 1rem;
  }

  @media (max-width: 400px) {
    grid-template-columns: auto 4rem;
    grid-column-gap: 0.75rem;
  }

  @media ${breakPoints.small} {
    height: initial;
  }
`;

interface Props {
  children: React.ReactNode;
}

const InformationalPage = (props: Props) => {
  const {
    children,
  } = props;
  return (
    <Root id={rootId}>
      <Header />
      <Content>
        {children}
      </Content>
      <Footer />
    </Root>
  );
};

export default InformationalPage;
