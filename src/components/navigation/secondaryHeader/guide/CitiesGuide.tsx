import React from 'react';
import Joyride, {CallBackProps, Step} from 'react-joyride';
import styled from 'styled-components';
import { primaryColor } from '../../../../styling/styleUtils';

const Text = styled.div`
  text-align: left;
`;
export const joyrideClassNames = {
  vizOptions: 'joyride-element-viz-options',
  searchInGraph: 'joyride-element-search-in-graph',
  searchCountryInGraph: 'joyride-element-search-country-in-graph',
  howToRead: 'joyride-element-how-to-read',
  compareEconComp: 'joyride-element-compare-econ-comp',
  colorLegend: 'joyride-element-color-legend',
  colorLegendNoFilter: 'joyride-element-color-legend-no-filter',
  guideButton: 'joyride-element-guide-button',
};

export const steps: Step[] = [
  {
    target: '.' + joyrideClassNames.vizOptions,
    // tslint:disable-next-line:max-line-length
    content: <Text>With the default visualization generated on the screen, use the Viz Option controls to further customize your data visualization.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.searchInGraph,
    // tslint:disable-next-line:max-line-length
    content: <Text>Search for a specific industry or knowledge cluster within the visualization by typing its name here.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.searchCountryInGraph,
    // tslint:disable-next-line:max-line-length
    content: <Text>Search for a specific city within the visualization by typing its name here.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.howToRead,
    // tslint:disable-next-line:max-line-length
    content: <Text>To learn how to interpret a given visualization, click here for a short tutorial.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.compareEconComp,
    // tslint:disable-next-line:max-line-length
    content: <Text>Click here to compare the economic composition of your selected city to that of another individual city or peer group.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.colorLegend,
    // tslint:disable-next-line:max-line-length
    content: <Text>A color legend can be found below the visualization.  Hover on each category to filter.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.colorLegendNoFilter,
    // tslint:disable-next-line:max-line-length
    content: <Text>A color legend can be found below the visualization.</Text>,
    disableBeacon: true,
    placement: 'left-start',
  },
  {
    target: '.' + joyrideClassNames.guideButton,
    // tslint:disable-next-line:max-line-length
    content: <Text>You can always find this tutorial here if you need to see it again.</Text>,
    disableBeacon: true,
    placement: 'bottom-start',
  },
];

interface Props {
  run: boolean;
  onClose: () => void;
}

const CitiesGuide = (props: Props) => {
  const {run, onClose} = props;
  const onChange = (input: CallBackProps) => {
    const {action} = input;
    if (action === 'reset' || action === 'close') {
      onClose();
    }
  };

  const filteredSteps = steps.filter(({target}) => {
    const element = document.querySelector<HTMLElement>(target as string);
    return element !== null && element.offsetParent !== null;
  });

  return (
    <Joyride
      steps={filteredSteps}
      run={run}
      continuous={true}
      showProgress={false}
      spotlightClicks={true}
      locale={
        { back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip' }
      }
      styles={{
        options: {
          primaryColor,
          zIndex: 1000,
        },
      }}
      callback={onChange}
      floaterProps={{disableAnimation: true}}
    />
  );
};

export default CitiesGuide;
