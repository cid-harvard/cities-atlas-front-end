import React from 'react';
import Header from '../../navigation/header';
import {
  InformationalPageRoot as RootBase,
  ContentContainer,
  breakPoints,
} from '../../../styling/GlobalGrid';
import {
  primaryColorDark,
  primaryHoverColor,
  lightBaseColor,
  baseColor,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import Footer from './Footer';

export const rootId = 'infromational-page-root-scroll-id';

const Root = styled(RootBase)`
  overflow: auto;
`;

const ContentStandard = styled(ContentContainer)`
  display: grid;
  padding: 1rem;
  grid-template-columns: auto 15rem;
  grid-column-gap: 5rem;
  max-width: 950px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  position: relative;

  h3 {
    color: ${baseColor};
  }

  h4 {
    color: ${lightBaseColor};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p a, h4 a {
    color: ${primaryColorDark};

    &:hover {
      color: ${primaryHoverColor};
    }
  }

  li {
    margin-bottom: 0.5rem;
  }

  cite {
    display: block;
    margin: 2rem 0 2rem;
    font-style: normal;
    padding-left: 0.875rem;
    border-left: solid 1px #dfdfdf;
    color: ${lightBaseColor};
  }

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

const ContentFull = styled(ContentContainer)`
  padding: 1rem;
  width: 100%;
  position: relative;
  box-sizing: border-box;
`;

interface Props {
  children: React.ReactNode;
  contentFull?: boolean;
}

const InformationalPage = (props: Props) => {
  const {
    children, contentFull,
  } = props;
  const Content = contentFull ? ContentFull : ContentStandard;
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
