import React, {useState} from 'react';
import Tooltip, {TooltipPosition} from '../../../general/Tooltip';
import raw from 'raw.macro';
import {useWindowWidth} from '../../../../contextProviders/appContext';
import {
  UtilityBarButtonBase,
  columnsToRowsBreakpoint,
  mediumSmallBreakpoint,
  Text,
  TooltipContent,
  LargeSvg,
} from '../../Utils';
import useFluent from '../../../../hooks/useFluent';
import CitiesGuide, {joyrideClassNames} from './CitiesGuide';

const guideIconSvg = raw('../../../../assets/icons/guide.svg');

const Guide = () => {
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  const [runTutorial, setRunTutorial] = useState<boolean>(false);
  return (
    <>
      <Tooltip
        explanation={windowDimensions.width < mediumSmallBreakpoint &&
          windowDimensions.width > columnsToRowsBreakpoint
          ? <TooltipContent>{getString('global-ui-guide')}</TooltipContent>
          : null
        }
        cursor='pointer'
        tooltipPosition={TooltipPosition.Bottom}
      >
        <UtilityBarButtonBase
          onClick={() => setRunTutorial(true)}
          className={joyrideClassNames.guideButton}
        >
          <LargeSvg
            dangerouslySetInnerHTML={{__html: guideIconSvg}}
          />
          <Text>
            {getString('global-ui-guide')}
          </Text>
        </UtilityBarButtonBase>
      </Tooltip>
      <CitiesGuide
        run={runTutorial}
        onClose={() => setRunTutorial(false)}
        startGuide={() => setRunTutorial(true)}
        key={runTutorial.toString()}
      />
    </>
  );
};

export default Guide;
