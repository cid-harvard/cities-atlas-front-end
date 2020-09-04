import React from 'react';
import Header from '../navigation/header';
import SecondaryHeader from '../navigation/secondaryHeader';
import SideNavigation, {
  Props as NavProps,
} from '../navigation/sideNav';
import PageChangeArrows from '../navigation/pageChangeArrows';
import {
  Root as RootBase,
  ContentContainer,
} from '../../styling/GlobalGrid';
import styled from 'styled-components/macro';

const Root = styled(RootBase)`
  pointer-events: none;
`;

type Props = NavProps & {
  children: React.ReactNode;
};

const InnerPage = (props: Props) => {
  const {
    children, baseLinkData,
  } = props;
  return (
    <Root>
      <Header />
      <SecondaryHeader />
      <SideNavigation baseLinkData={baseLinkData} />
      <ContentContainer>
        {children}
      </ContentContainer>
      <PageChangeArrows baseLinkData={baseLinkData} />
    </Root>
  );
};

export default InnerPage;
