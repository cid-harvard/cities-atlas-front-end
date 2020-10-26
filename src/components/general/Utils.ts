import {
  baseColor,
  secondaryFont,
} from '../../styling/styleUtils';
import styled from 'styled-components/macro';

export const ButtonBase = styled.button`
  color: ${baseColor};
  background-color: transparent;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  display: flex;
  align-items: center;
  font-size: clamp(0.75rem, 1.25vw, 0.9rem);
  padding: clamp(0.25rem, 0.5vw, 0.6rem);
  flex-shrink: 0;

  span {
    width: clamp(0.65rem, 1.5vw, 0.85rem);
    height: clamp(0.65rem, 1.5vw, 0.85rem);
    display: inline-block;
    line-height: 0;
    margin-right: 0.25rem;

    svg {
      width: 100%;
      height: 100%;
      fill: ${baseColor};
    }
  }

  &:hover {
    background-color: ${baseColor};
    color: #fff;

    span svg {
      fill: #fff;
    }
  }
`;
