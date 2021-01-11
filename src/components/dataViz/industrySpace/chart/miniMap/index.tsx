import React, {useEffect, useState, useRef} from 'react';
import createChart from './createChart';
import useLayoutData from '../useLayoutData';

type Chart = {
  initialized: false;
} | {
  initialized: true;
  render: (nodeId: string | undefined) => void;
};

interface Props {
  width: number;
  height: number;
  highlighted: string | undefined;
}

const Chart = (props: Props) => {
  const {
    width, height, highlighted,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<Chart>({initialized: false});

  const layout = useLayoutData();

  useEffect(() => {
    const chartNode = chartRef.current;
    if (chartNode) {
      if (chartNode && layout.data && (
          (chart.initialized === false && width && height)
      )) {
        chartNode.innerHTML = '';
        setChart({...createChart({
          rootEl: chartNode,
          data: layout.data,
          rootWidth: width,
          rootHeight: height,
        }), initialized: true });
      }
    }
  }, [chartRef, chart, width, height, layout]);

  useEffect(() => {
    if (chart.initialized) {
      chart.render(highlighted);
    }
  }, [chart, highlighted]);

  return (
    <>
      <div
        ref={chartRef}
        style={{width, height}}
      />
    </>
  );
};

export default React.memo(Chart);
