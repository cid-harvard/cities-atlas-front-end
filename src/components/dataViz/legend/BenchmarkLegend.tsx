import React from 'react';
import styled, { keyframes } from 'styled-components';
import useCurrentBenchmark from '../../../hooks/useCurrentBenchmark';
import useFluent from '../../../hooks/useFluent';
import { benchmarkColor } from '../../../styling/styleUtils';
import BenchmarkSVG from '../../../assets/icons/benchmark_comparator.svg';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(-30deg);
  }

  15% {
    transform: rotate(-40deg);
  }

  20% {
    transform: rotate(-45deg);
  }

  60% {
    transform: rotate(360deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

const Root = styled.button`
  pointer-events: all;
  text-align: center;
  background-color: transparent;
  font-size: 0.65rem;
  margin: 0.25rem 0 1rem;
  color: ${benchmarkColor};
  max-width: 100%;

  &:hover {
    img {
      animation: ${rotate} 2s ease-in-out infinite;
    }
  }
`;

const Title = styled.strong`
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-right: 0.25rem;

  @media (max-width: 950px) {
    display: block;
  }
`;

const Icon = styled.img`
  width: 1rem;
  height: 1rem;
  position: relative;
  top: 0.25rem;
  margin-right: 0.25rem;
`;

const BenchmarkLegend = () => {
  const getString = useFluent();
  const { benchmarkName } = useCurrentBenchmark();

  return (
    <Root>
      <Title>
        <Icon src={BenchmarkSVG} />
        {getString('global-ui-change-benchmark')}
      </Title>
      ({benchmarkName})
    </Root>
  );
};

export default BenchmarkLegend;
