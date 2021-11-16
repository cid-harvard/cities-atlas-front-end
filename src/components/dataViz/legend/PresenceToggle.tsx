import React, { useState } from 'react';
import useFluent from '../../../hooks/useFluent';
import styled from 'styled-components';
import { backgroundDark, benchmarkColor, lightBorderColor, primaryFont } from '../../../styling/styleUtils';
import Tooltip from '../../general/Tooltip';
import BenchmarkSVG from '../../../assets/icons/benchmark_comparator.svg';
import { breakPoints } from '../../../styling/GlobalGrid';

const Root = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonsRoot = styled.div`
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  pointer-events: all;
  font-family: ${primaryFont};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border: solid 1px ${benchmarkColor};
  background-color: transparent;
  display: block;
  width: 100%;
`;

const ToggleButton = styled(Button)`
  border: solid 1px ${lightBorderColor};

  &:hover {
    background-color: ${lightBorderColor};
  }
`;

const OneTimeTooltip = styled.div`
  position: absolute;
  background-color: ${backgroundDark};
  color: #fff;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  z-index: 100;
  pointer-events: all;
  max-width: 190px;
  white-space: normal;
  text-transform: none;
  font-weight: 400;
  transform: translateX(calc(100% - 2rem));

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -0.4rem;
    margin: auto;
    width: 0;
    height: 0;
    border-top: 0.4rem solid transparent;
    border-bottom: 0.4rem solid transparent;
    border-right:0.4rem solid ${backgroundDark};
  }

  @media ${breakPoints.small} {
    transform: translate(-8%, -76%);

    &:before {
      width: 0;
      height: 0;
      left: 0;
      right: 0;
      top: auto;
      bottom: -0.4rem;
      border-left: 0.4rem solid transparent;
      border-right: 0.4rem solid transparent;
      border-top: 0.4rem solid ${backgroundDark};
      border-bottom: none;
    }
  }
`;

const DismissTooltipButton = styled.button`
  border: solid 1px #fff;
  background-color: transparent;
  color: #fff;
  font-family: ${primaryFont};
  font-size: 0.875rem;
  margin-top: 0.75rem;

  &:hover {
    background-color: #fff;
    color: ${backgroundDark};
  }
`;

const Icon = styled.img`
  width: 1rem;
  height: 1rem;
  position: relative;
  top: 0.25rem;
  margin-right: 0.25rem;
`;

const HighlightedTooltipText = styled.span`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875em;
  color: ${benchmarkColor};
  margin: 0 0.2rem;
  white-space: nowrap;
`;

const BenchmarkText = () => {
  return (
    <HighlightedTooltipText>
      <Icon src={BenchmarkSVG} />
      Change Benchmark
    </HighlightedTooltipText>
  );
};

const oneTimeTooltipLocalStorageKey = 'benchmarkPresenceToggleAxisOneTimeTooltipLocalStorageKeyv2';
enum StringBoolean {
  'TRUE' = 'TRUE',
  'FALSE' = 'FALSE',
}

export enum Highlighted {
  relative = 'relative',
  absolute = 'absolute',
}

interface Props {
  togglePresence?: boolean;
  highlight?: Highlighted;
  onButtonClick?: (highlighted: Highlighted) => void;
  showArrows?: boolean;
}

const PresenceToggle = (props: Props) => {
  const {
    togglePresence, highlight, showArrows, onButtonClick,
  } = props;
  const getString = useFluent();

  const initialShowOverviewTooltip = localStorage.getItem(oneTimeTooltipLocalStorageKey) === StringBoolean.TRUE ? false : true;
  const [showOverviewTooltip, setShowOverviewTooltip] = useState<boolean>(initialShowOverviewTooltip);
  const dismissOverviewTooltip = () => {
    setShowOverviewTooltip(false);
    localStorage.setItem(oneTimeTooltipLocalStorageKey, StringBoolean.TRUE);
  };

  const highlightedStyles: React.CSSProperties = {
    backgroundColor: lightBorderColor,
    borderColor: benchmarkColor,
  };
  const presenceButtons = togglePresence ? (
    <>
      <Tooltip
        explanation={getString('global-ui-relative-presence')}
      >
        <ToggleButton
          style={highlight === Highlighted.relative ? highlightedStyles : undefined}
          onClick={onButtonClick ? () => onButtonClick(Highlighted.relative) : undefined}
        >
          <Tooltip
            explanation={getString('global-ui-relative-presence')}
          />
          {getString('global-ui-relative-presence')}
        </ToggleButton>
      </Tooltip>
      <Tooltip
        explanation={getString('global-ui-absolute-presence')}
      >
        <ToggleButton
          style={highlight === Highlighted.absolute ? highlightedStyles : undefined}
          onClick={onButtonClick ? () => onButtonClick(Highlighted.absolute) : undefined}
        >
          <Tooltip
            explanation={getString('global-ui-absolute-presence')}
          />
          {getString('global-ui-absolute-presence')}
        </ToggleButton>
      </Tooltip>
    </>
  ) : (
    <Tooltip
      explanation = { getString('global-ui-relative-presence') }
    >
      <Button>
        <Tooltip
          explanation = { getString('global-ui-relative-presence') }
        />
        { getString('global-ui-relative-presence') }
      </Button >
    </Tooltip >
  );

  const arrowLeft = showArrows ? '←' : null;
  const arrowRight = showArrows ? '→' : null;

  const oneTimeTooltip = showOverviewTooltip ? (
    <OneTimeTooltip>
      Hover on labels to learn more. Click on <BenchmarkText /> to change current benchmark.<br />
      <DismissTooltipButton onClick={dismissOverviewTooltip}>{getString('city-overview-one-time-tooltip-got-it')}</DismissTooltipButton>
    </OneTimeTooltip>
  ) : false;

  return (
    <Root>
      {arrowLeft}
        <ButtonsRoot>
          {presenceButtons}
        </ButtonsRoot>
      {arrowRight}
      {oneTimeTooltip}
    </Root>
  );
};

export default PresenceToggle;
