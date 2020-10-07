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
}

const CategoryLabels = ({categories}: Props) => {
  const labels = categories.map(category => {
    return (
      <Label
        key={'sector-label-' + category.id}
        category={category}
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
