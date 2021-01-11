import React, {useRef, useEffect, useState} from 'react';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import Chart from './chart/miniMap';

const Root = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #fff;
  box-sizing: border-box;
`;

const IndustrySpaceContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

interface Props {
  highlighted: string | undefined;
}

const ClusteredIndustrySpace = (props: Props) => {
  const {highlighted} = props;
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const chartKey = dimensions
    ? 'industry-space-sized-to-container-key' + dimensions.width.toString() + dimensions.height.toString()
    : 'industry-space-sized-to-container-key-0-0';

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
      }, 0);
    }
  }, [rootRef, windowDimensions]);

  return (
    <>
      <Root ref={rootRef}>
        <IndustrySpaceContainer>
          <Chart key={chartKey}
            width={dimensions ? dimensions.width : 0}
            height={dimensions ? dimensions.height : 0}
            highlighted={highlighted}
          />
      </IndustrySpaceContainer>
      </Root>
    </>
  );
};

export default ClusteredIndustrySpace;
