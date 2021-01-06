import React, {useEffect, useState, useRef} from 'react';
import {usePrevious} from 'react-use';
import createChart from './createChart';
import useLayoutData from './useLayoutData';

type Chart = {
  initialized: false;
} | {
  initialized: true;
  update: () => void;
}

interface Props {
  width: number;
  height: number;
}

const Chart = (props: Props) => {
  const {
    width, height,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});
  const prevWidth = usePrevious(width);
  const prevHeight = usePrevious(height);

  const layout = useLayoutData();

  useEffect(() => {
    const chartNode = chartRef.current;
    if (chartNode) {
      if (chartNode && layout.data && (
          (chart.initialized === false && width && height) ||
          (chart.initialized === true && width !== prevWidth && height !== prevHeight)
      )) {
        console.log(layout.data);
        chartNode.innerHTML = '';
        const {update} = createChart();
        setChart({initialized: true, update});
      }
    }
  }, [chartRef, chart, width, height, prevWidth, prevHeight, layout])

  return (
    <div
      ref={chartRef}
      style={{backgroundColor: 'salmon', width, height}}
    />
  );
}

export default React.memo(Chart);
