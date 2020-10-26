import React from 'react';
import styled from 'styled-components/macro';
import Label, {CategoryDatum} from './Label';
import {breakPoints} from '../../../styling/GlobalGrid';

const RootBase = styled.div`
  grid-row: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 1rem 0 0;

  @media ${breakPoints.small} {
    grid-row: 4;
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

interface Props {
  categories: CategoryDatum[];
  toggleCategory: (id: string) => void;
  isolateCategory: (id: string) => void;
  hiddenCategories: string[];
  fullWidth?: boolean;
}

const CategoryLabels = ({categories, toggleCategory, isolateCategory, hiddenCategories, fullWidth}: Props) => {
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

  return (
    <Root>
      {labels}
    </Root>
  );
};

export default CategoryLabels;
