import React from 'react';
import {textClassName, ExpandingButton} from '../Utils';
import raw from 'raw.macro';
import useFluent from '../../../hooks/useFluent';

const readThisChartIconSVG = raw('../../../assets/icons/read-this-chart.svg');

const HowToRead = () => {
  const getString = useFluent();

  return (
    <ExpandingButton>
      <span dangerouslySetInnerHTML={{__html: readThisChartIconSVG}} />
      <div className={textClassName}>{getString('global-ui-read-chart')}</div>
    </ExpandingButton>
  );
};

export default HowToRead;
