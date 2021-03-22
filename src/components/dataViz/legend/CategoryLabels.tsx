import React from 'react';
import styled, {keyframes} from 'styled-components/macro';
import Label, {CategoryDatum} from './Label';
import {breakPoints} from '../../../styling/GlobalGrid';
import {
  backgroundMedium,
  baseColor,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';

const ReloadImgSrc = raw('../../../assets/icons/reload.svg');

const RootBase = styled.div`
  grid-row: 3;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  @media ${breakPoints.small} {
    grid-row: 4;
  }
`;

const StandardRoot = styled(RootBase)`
  grid-column: 1;
  justify-content: center;
`;

const FullWidthRoot = styled(RootBase)`
  grid-column: 1 / -1;
`;

const StandardContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  align-items: center;
  box-sizing: border-box;
  padding: 0.875rem 0 1rem;
  margin-bottom: 1rem;

  @media ${breakPoints.small} {
    margin-bottom: 3rem;
  }
`;

const FullWidthContent = styled(StandardContent)`
  padding: 0.875rem 0;

  @media ${breakPoints.small} {
    padding-right: 0;
  }

  @media (min-width: 1001px) {
    margin-bottom: 0;
  }
`;

const fadeAndSlideIn = keyframes`
  0% {
    transform: translate(300%, 0);
    opacity: 0;
  }

  70% {
    transform: translate(90%, 0);
    opacity: 0.7;
  }

  100% {
    transform: translate(110%, 0);
    opacity: 1;
  }
`;

const fadeAndSlideDown = keyframes`
  0% {
    transform: translate(0, -50%);
    opacity: 0;
  }

  70% {
    transform: translate(0, 20%);
    opacity: 0.7;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`;

const ResetLabelsButtonContainer = styled.div`
  position: absolute;
  text-align: center;
  pointer-events: none;
  right: 0;

  @media (max-width: 1000px) {
    left: 0;
    bottom: -0.5rem;
  }
`;

const ResetLabelsButton = styled.button`
  pointer-events: all;
  animation: ${fadeAndSlideIn} 0.2s ease-in-out 1 forwards;
  text-transform: uppercase;
  color: ${baseColor};
  background-color: ${backgroundMedium};
  font-size: 0.5rem;
  font-weight: 600;
  outline-color: ${backgroundMedium};
  transition: outline 0.1s ease-in-out;
  padding: 0.3rem 0.5rem;
  display: inline-flex;
  align-items: center;
  width: 5rem;

  &:hover, &:focus {
    outline: solid 2px ${backgroundMedium};
  }

  @media (max-width: 1000px) {
    animation: ${fadeAndSlideDown} 0.2s ease-in-out 1 forwards;
    width: auto;
    left: 0;
    bottom: 0;
  }
`;

const ReloadIcon = styled.div`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${baseColor};
    }
  }

  @media (max-width: 1000px) {
    width: 0.7rem;
    height: 0.7rem;
  }
`;

interface BaseProps {
  categories: CategoryDatum[];
  fullWidth?: boolean;
}

type Props = BaseProps & (
  {
    allowToggle: true;
    toggleCategory: (id: string) => void;
    isolateCategory: (id: string) => void;
    hiddenCategories: string[];
    resetCategories: () => void;
    resetText: string;
  } | {
    allowToggle: false;
  }
);

const CategoryLabels = (props: Props) => {
  const {categories, fullWidth} = props;
  let output: React.ReactElement<any>;
  if (props.allowToggle) {
    const {
      toggleCategory, isolateCategory, hiddenCategories,
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

    const resetButton = hiddenCategories.length ? (
      <ResetLabelsButtonContainer>
        <ResetLabelsButton onClick={resetCategories}>
          <ReloadIcon dangerouslySetInnerHTML={{__html: ReloadImgSrc}} /> {resetText}
        </ResetLabelsButton>
      </ResetLabelsButtonContainer>
    ) : null;

    output = (
      <>
        {labels}
        {resetButton}
      </>
    );
  } else {
    const labels = categories.map(category => (
      <Label
        key={'sector-label-' + category.id}
        category={category}
        isHidden={false}
        isIsolated={false}
      />
    ));

    output = (
      <>
        {labels}
      </>
    );
  }

  const Root = fullWidth ? FullWidthRoot : StandardRoot;
  const Content = fullWidth ? FullWidthContent : StandardContent;

  return (
    <Root>
      <Content>
        {output}
      </Content>
    </Root>
  );
};

export default CategoryLabels;
