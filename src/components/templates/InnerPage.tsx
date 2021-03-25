import React, {useState} from 'react';
import Header from '../navigation/header';
import SecondaryHeader from '../navigation/secondaryHeader';
import SideNavigation, {
  Props as NavProps,
} from '../navigation/sideNav';
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
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <Root>
      <Header />
      <SecondaryHeader />
      <SideNavigation
        baseLinkData={baseLinkData}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <ContentContainer key={'container-collapsed-' + collapsed}>
        {children}
      </ContentContainer>
    </Root>
  );
};

export default InnerPage;
