import React from 'react';
import useFluent from '../../../../../hooks/useFluent';
import styled from 'styled-components';
import { primaryColor, secondaryFont } from '../../../../../styling/styleUtils';
import { breakPoints } from '../../../../../styling/GlobalGrid';

const Root = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 1rem;
  box-sizing: border-box;

  @media ${breakPoints.small} {
    position: static;
    height: auto;
  }
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  text-transform: uppercase;

  @media (max-width: 920px) {
    font-size: 1.5rem;
  }
`;

const SectionHeader = styled.h2`
  font-size: 1rem;
  color: ${primaryColor};
  font-family: ${secondaryFont};
  margin-bottom: 0.2rem;
`;

const Section = styled.div`
  font-size: 0.85rem;
`;

const Concepts = () => {
  const getString = useFluent();
  return (
    <Root>
      <Title>{getString('city-overview-metroverse-concepts')}</Title>
      <SectionHeader>{getString('city-overview-relative-presence-title')}</SectionHeader>
      <Section dangerouslySetInnerHTML={{ __html: getString('city-overview-relative-presence-desc') }} />
      <SectionHeader>{getString('city-overview-knowledge-cluster-title')}</SectionHeader>
      <Section dangerouslySetInnerHTML={{ __html: getString('city-overview-knowledge-cluster-desc') }} />
      <SectionHeader>{getString('city-overview-industry-space-title')}</SectionHeader>
      <Section dangerouslySetInnerHTML={{ __html: getString('city-overview-industry-space-desc') }} />
      <SectionHeader>{getString('city-overview-city-similarity-title')}</SectionHeader>
      <Section dangerouslySetInnerHTML={{ __html: getString('city-overview-city-similarity-desc') }} />
    </Root>
  );
};

export default Concepts;
