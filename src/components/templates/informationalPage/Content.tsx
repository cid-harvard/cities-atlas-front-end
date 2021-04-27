import React from 'react';
import styled from 'styled-components/macro';
import {Link} from 'react-router-dom';
import {
  primaryColor,
  backgroundMedium,
  backgroundDark,
} from '../../../styling/styleUtils';

const ContentContainer = styled.div``;
const NavContainer = styled.div`
`;

const StickyContainer = styled.div`
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
`;

const LinkBase = styled(Link)`
  padding: 0.75rem 0.65rem;
  border-left: solid 4px rgba(0, 0, 0, 0);
  text-transform: uppercase;
  color: ${backgroundDark};
  text-decoration: none;
  margin-bottom: 0.65rem;
  font-size: 1.1rem;

  &:hover,
  &.active {
    background-color: ${backgroundMedium};
    border-left-color: ${primaryColor};
  }

  @media (max-width: 760px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.35rem;
  }

  @media (max-width: 400px) {
    font-size: 0.75rem;
    padding: 0.35rem 0.15rem;
  }
`;

export interface Section {
  label: string;
  route: string;
  active: boolean;
  Component: (props: any) => JSX.Element;
}

interface Props {
  sections: Section[];
}

const Content = (props: Props) => {
  const {sections} = props;
  const navLinks: React.ReactElement<any>[] = [];
  const contentSections: React.ReactElement<any>[] = [];
  sections.forEach(({route, label, active, Component}) => {
    navLinks.push(
      <LinkBase to={route} key={'side-nav-to-' + route} className={active ? 'active' : undefined}>
        {label}
      </LinkBase>,
    );
    contentSections.push(<Component key={'component-for-' + route} />);
  });
  return (
    <>
      <ContentContainer>
        {contentSections}
      </ContentContainer>
      <NavContainer>
        <StickyContainer>
          {navLinks}
        </StickyContainer>
      </NavContainer>
    </>
  );
};

export default Content;
