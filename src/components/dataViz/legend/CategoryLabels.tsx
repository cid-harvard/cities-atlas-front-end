import React from 'react';
import styled, {keyframes} from 'styled-components/macro';
import Label, {CategoryDatum} from './Label';
import {breakPoints} from '../../../styling/GlobalGrid';
import {
  secondaryFont,
  backgroundMedium,
  baseColor,
} from '../../../styling/styleUtils';

const RootBase = styled.div`
  grid-row: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 1rem 0 0;
  position: relative;
  margin-bottom: 1rem;

  @media ${breakPoints.small} {
    grid-row: 4;
    margin-bottom: 3rem;
  }
`;

const StandardRoot = styled(RootBase)`
  grid-column: 1;
`;

const FullWidthRoot = styled(RootBase)`
  grid-column: 1 / -1;
  padding: 1rem;

  @media ${breakPoints.small} {
    padding-right: 0;
  }
`;

const fadeAndSlideIn = keyframes`
  from {
    transform: translate(0, 0);
    opacity: 0;
  }

  to {
    transform: translate(0, calc(50% + 0.25rem));
    opacity: 1;
  }
`;

const ResetLabelsButtonContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  pointer-events: none;
`;

const ResetLabelsButton = styled.button`
  pointer-events: all;
  animation: ${fadeAndSlideIn} 0.2s linear 1 forwards;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  color: ${baseColor};
  background-color: ${backgroundMedium};
  font-size: 0.7rem;
  outline-color: ${backgroundMedium};
  transition: outline 0.1s linear;

  &:hover, &:focus {
    outline: solid 2px ${backgroundMedium};
  }
`;

interface Props {
  categories: CategoryDatum[];
  toggleCategory: (id: string) => void;
  isolateCategory: (id: string) => void;
  hiddenCategories: string[];
  resetCategories: () => void;
  resetText: string;
  fullWidth?: boolean;
}

const CategoryLabels = (props: Props) => {
  const {
    categories, toggleCategory, isolateCategory, hiddenCategories, fullWidth,
    resetCategories, resetText,
  } = props;
  const labels = categories.map(category => {
    const isHidden = !!hiddenCategories.find(id => id === category.id);
    const isIsolated = hiddenCategories.length === categories.length - 1 && !isHidden;
    return (
      <Label
        key={'sector-label-' + category.id}
        category={category}
        toggleCategory={() => toggleCategory(category.id)}
        isolateCategory={() => isolateCategory(category.id)}
        isHidden={isHidden}
        isIsolated={isIsolated}
      />
    );
  });

  const Root = fullWidth ? FullWidthRoot : StandardRoot;

  const resetButton = hiddenCategories.length ? (
    <ResetLabelsButtonContainer>
      <ResetLabelsButton onClick={resetCategories}>
        ⟳ {resetText}
      </ResetLabelsButton>
    </ResetLabelsButtonContainer>
  ) : null;

  return (
    <Root>
      {labels}
      {resetButton}
    </Root>
  );
};

export default CategoryLabels;
