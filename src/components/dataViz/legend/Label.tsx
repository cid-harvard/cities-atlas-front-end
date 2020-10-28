import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  primaryFont,
  fadeInAnimation,
  backgroundDark,
  secondaryFont,
} from '../../../styling/styleUtils';
import {rgba} from 'polished';
import useFluent from '../../../hooks/useFluent';

const Root = styled.div`
  position: relative;
  font-family: ${primaryFont};
  z-index: 40;
`;
const Button = styled.button`
  display: flex;
  align-items: center;
  margin: 0.1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-family: ${primaryFont};
  background-color: #fff;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
`;

const Block = styled.div<{$checked: boolean}>`
  width: 0.7rem;
  height: 0.7rem;
  margin-right: 0.2rem;
  position: relative;

  &:after {
    ${({$checked}) => $checked ? "content: '';" : ''}
    width: 0.1rem;
    border-radius: 80px;
    height: 180%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    transform: rotate(45deg);
    background-color: #333;
  }
`;

const HideIsolateRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: translate(0, -100%);
  pointer-events: none;
  display: flex;
  justify-content: center;
  ${fadeInAnimation}
`;

const HideIsolateContent = styled.div`
  pointer-events: all;
  margin: auto;
  position: relative;
`;

const HideIsolateText = styled.div`
  border-radius: 4px;
  padding: 0.6rem 0.85rem;
  background-color: ${backgroundDark};
  color: #fff;
  border-radius: 4px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
`;

const ArrowContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
`;

const Arrow = styled.div`
  width: 0;
  height: 0;
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  border-top: 0.5rem solid ${backgroundDark};
  position: relative;
  top: -2px;
`;

const Title = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  text-align: center;
`;

const Hr = styled.hr`
  max-width: 5rem;
  border-top: solid 2px;
`;

const CloseButton = styled.button`
  border: none;
  padding: 0.2rem;
  background-color: transparent;
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
const HideIsolateButton = styled.button<{$checked: boolean}>`
  margin: 0.5rem;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  color: #fff;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  position: relative;
  white-space: nowrap;

  &:before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 200px;
    border: solid 1px #fff;
    margin-right: 0.25rem;
  }

  &:after {
    ${({$checked}) => $checked ? "content: '';" : ''}
    width: 6px;
    height: 6px;
    border-radius: 200px;
    background-color: #fff;
    left: 10px;
    position: absolute;
  }

  &:hover {
    background-color: #fff;
    color: ${backgroundDark};

    &:before {
      border-color: ${backgroundDark};
    }

    &:after {
      background-color: ${backgroundDark};
    }
  }
`;

export interface CategoryDatum {
  id: string;
  color: string;
  name: string;
}

interface Props {
  category: CategoryDatum;
  toggleCategory: () => void;
  isolateCategory: () => void;
  isHidden: boolean;
  isIsolated: boolean;
}

const Label = ({category: {color, name}, toggleCategory, isolateCategory, isHidden, isIsolated}: Props) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const getString = useFluent();
  const hideIsolate = isHovered ? (
    <HideIsolateRoot>
      <HideIsolateContent>
        <HideIsolateText>
          <Title>{name}</Title>
          <Hr style={{borderColor: color}}/>
          <ButtonWrapper>
            <HideIsolateButton
              $checked={isHidden}
              onClick={toggleCategory}
            >
              {getString('global-ui-hide')}
            </HideIsolateButton>
            <HideIsolateButton
              $checked={isIsolated}
              onClick={isolateCategory}
            >
              {getString('global-ui-keep-only')}
            </HideIsolateButton>
          </ButtonWrapper>
        </HideIsolateText>
        <ArrowContainer>
          <Arrow />
        </ArrowContainer>
        <CloseButton onClick={() => setIsHovered(false)}>
          ×
        </CloseButton>
      </HideIsolateContent>
    </HideIsolateRoot>
  ) : null;
  return (
    <Root
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        style={{
          backgroundColor: isHovered ? rgba(color, 0.3) : undefined,
          opacity: isHidden ? 0.5 : undefined,
        }}
        onClick={toggleCategory}
      >
        <Block
          style={{backgroundColor: color}}
          $checked={isHidden}
        />
        {name}
      </Button>
      {hideIsolate}
    </Root>
  );
};

export default Label;
