import React from 'react';
import styled from 'styled-components/macro';
import ReactSlider from 'react-slider';
import {
  primaryColor,
  backgroundDark,
  backgroundMedium,
} from '../../../styling/styleUtils';
import {scaleLog} from 'd3-scale';

const slideRootClassName = 'react-slider-root-class';
const slideThumbClassName = 'react-slider-thumb-class';
const slideTrackClassName = 'react-slider-track-class';

const SliderContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem 0 2rem;
  flex-shrink: 0;
  margin: 0.65rem 0 1.15rem;
  position: relative;

  .${slideThumbClassName} {
    background-color: ${primaryColor};
    height: 1rem;
    width: 1rem;
    border-radius: 1000px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;

    span {
      color: ${primaryColor};
      transform: translateY(-125%);
      white-space: nowrap;
    }
  }
  .${slideThumbClassName}-0 {
    transform: translateX(-0.1rem);
  }
  .${slideTrackClassName} {
    margin-top: 0.25rem;
  }
  .${slideTrackClassName}-0 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
  .${slideTrackClassName}-1 {
    background-color: ${backgroundDark};
    height: 0.5rem;
  }
  .${slideTrackClassName}-2 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
`;

// 0.0001
// 0.001
// 0.01
// 0.1
// 1
// 10
// 100
// 1000


interface Props {
  updateValue: (val: number) => void;
  initialValue: number;
}

interface ThumbState {
  index: number;
  value: number | number[];
  valueNow: number;
}

const RCAThresholdSlider = ({updateValue, initialValue}: Props) => {
  const logScale = scaleLog().domain([0.0001, 1000]).range([1, 8]);

  const logScaleWithZero = (value: number) => value ? logScale(value) : 0;
  const convertValue = (value: number) => value ? parseFloat(logScale.invert(value).toFixed(6)) : 0;

  const thumbRender = (p: React.HTMLProps<HTMLDivElement>, state: ThumbState) => (
    <small {...p}><span>RCA {'≥'} {convertValue(state.valueNow)}</span></small>
  );

  return (
    <SliderContainer>
      <ReactSlider
        className={slideRootClassName}
        thumbClassName={slideThumbClassName}
        trackClassName={slideTrackClassName}
        defaultValue={isNaN(initialValue) ? logScale(1) : logScaleWithZero(initialValue)}
        renderThumb={thumbRender}
        max={8}
        min={0}
        onAfterChange={(v: number) => updateValue(convertValue(v))}
      />
    </SliderContainer>
  );
};

export default RCAThresholdSlider;