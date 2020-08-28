import React from 'react';
import Header from '../navigation/header';
import SecondaryHeader from '../navigation/secondaryHeader';
import SideNavigation from '../navigation/sideNav';
import PageChangeArrows from '../navigation/pageChangeArrows';
import {
  Root,
  ContentContainer,
} from '../../styling/GlobalGrid';

interface Props {
  children: React.ReactNode;
}

const InnerPage = (props: Props) => {
  const {children} = props;
  return (
    <Root>
      <Header />
      <SecondaryHeader />
      <SideNavigation />
      <ContentContainer>
        {children}
      </ContentContainer>
      <PageChangeArrows />
    </Root>
  );
};

export default InnerPage;
