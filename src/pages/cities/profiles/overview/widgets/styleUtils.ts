import styled from 'styled-components';
import { breakPointValues, breakPoints as globalBreakPoints } from '../../../../../styling/GlobalGrid';
import { backgroundMedium, baseColor, primaryColor, secondaryFont } from '../../../../../styling/styleUtils';

const breakPoints = {
  medium: 'screen and (max-width: 1250px)',
  small: `screen and (max-width: 1070px) and (min-width: ${breakPointValues.width.small}px)`,
};

export const TitleBase = styled.h2`
  background-color: ${backgroundMedium};
  font-family: ${secondaryFont};
  font-size: 1rem;
  margin: 0 0.25rem 0.25rem;
  padding: 0.5rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  @media ${breakPoints.medium} {
    font-size: .95rem;
    height: auto;
    padding: 0.25rem;
    white-space: initial;
    flex-direction: column;
    text-align: center;
  }

  @media ${breakPoints.small} {
    font-size: .85rem;
    height: auto;
    white-space: initial;
    flex-direction: column;
  }

  @media ${globalBreakPoints.small} {
    flex-direction: row;
  }
`;

export const WrappableText = styled.div`
  white-space: normal;
`;

export const TitleSmall = styled(TitleBase)`
  font-size: 0.7rem;
  white-space: nowrap;

  @media ${breakPoints.medium} {
    font-size: .65rem;
  }
`;

export const YearText = styled.small`
  color: ${primaryColor};
  font-size: 0.7rem;
  line-height: 0;
  font-weight: 600;
  display: inline-block;
  padding: 0.5rem;

  @media ${breakPoints.medium} {
    font-size: .65rem;
  }
`;

export const Icon = styled.img`
  width: 1.25rem;
  margin-right: 0.5rem;

  @media ${breakPoints.medium}, (max-height: 800px) {
    width: .75rem;
  }

  @media ${breakPoints.small} {
    display: none;
  }
`;

export const ValueBase = styled.h3`
  color: ${baseColor};
  font-weight: 400;
  font-variant: small-caps;
  font-size: 1.8rem;
  text-align: center;
  margin: 0;

  @media ${breakPoints.medium}, (max-height: 800px) {
    font-size: 1.2rem;
  }

  @media ${globalBreakPoints.small} {
    margin-bottom: 1.5rem;
  }
`;

export const ListItem = styled.div`
  font-size: 1.1rem;

  @media ${breakPoints.medium}, (max-height: 800px) {
    font-size: 0.85rem;
  }
`;