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

const Root = styled.div`
  width: 60%;
`;
const SliderContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem 0 2rem;
  flex-shrink: 0;
  margin: 0rem auto 1.15rem;
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
  const logScale = scaleLog().domain([0.001, 100]).range([1, 120]);

  const logScaleWithZero = (value: number) => value ? logScale(value) : 0;
  const convertValue = (value: number) => {
    const logValue = value ? logScale.invert(value) : 0;
    let decimalPlaces = 0;
    if (logValue < 0.0001) {
      decimalPlaces = 6;
    } else if (logValue < 0.001) {
      decimalPlaces = 5;
    } else if (logValue < 0.01) {
      decimalPlaces = 4;
    } else if (logValue < 0.1) {
      decimalPlaces = 3;
    } else if (logValue < 0.9) {
      decimalPlaces = 2;
    }  else if (logValue < 10 && logValue > 1.15) {
      decimalPlaces = 1;
    } else {
      decimalPlaces = 0;
    }
    return value ? parseFloat(logValue.toFixed(decimalPlaces)) : 0;
  };

  const thumbRender = (p: React.HTMLProps<HTMLDivElement>, state: ThumbState) => (
    <small {...p}><span>Presence Value {'≥'} {convertValue(state.valueNow)}</span></small>
  );

  return (
    <Root>
      <SliderContainer>
        <ReactSlider
          className={slideRootClassName}
          thumbClassName={slideThumbClassName}
          trackClassName={slideTrackClassName}
          defaultValue={isNaN(initialValue) ? logScaleWithZero(1) : logScaleWithZero(initialValue)}
          renderThumb={thumbRender}
          max={120}
          min={0}
          onAfterChange={(v: number) => updateValue(convertValue(v))}
        />
      </SliderContainer>
    </Root>
  );
};

export default RCAThresholdSlider;