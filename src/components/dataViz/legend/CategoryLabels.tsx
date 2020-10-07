import React from 'react';
import styled from 'styled-components/macro';
import Label, {CategoryDatum} from './Label';

const Root = styled.div`
  grid-row: 3;
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 1rem 0 0;
`;

interface Props {
  categories: CategoryDatum[];
  toggleCategory: (id: string) => void;
  isolateCategory: (id: string) => void;
  hiddenCategories: string[];
}

const CategoryLabels = ({categories, toggleCategory, isolateCategory, hiddenCategories}: Props) => {
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

  return (
    <Root>
      {labels}
    </Root>
  );
};

export default CategoryLabels;
