import React, { useState } from 'react';
import useFluent from '../../../hooks/useFluent';
import styled from 'styled-components';
import { backgroundDark, benchmarkColor, lightBorderColor, primaryFont, secondaryFont } from '../../../styling/styleUtils';
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

const EquationContainer = styled.div`
  margin-top: 0.5rem;
  `;
const Division = styled.div`
  margin-top: 0.25rem;
  font-size: 0.85em;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: ${secondaryFont};
`;
const Subtraction = styled.div`
  margin-top: 0.25rem;
  font-size: 0.85em;
  display: flex;
  text-align: center;
  font-family: ${secondaryFont};
`;
const Top = styled.div`
  padding-bottom: 0.1rem;
  margin-bottom: 0.1rem;
  border-bottom: solid 1px #333;
  max-width: min-content;
  flex-grow: 0;
  white-space: nowrap;
`;
const Bottom = styled.div`
`;

const BenchmarkText = () => {
  return (
    <HighlightedTooltipText>
      <Icon src={BenchmarkSVG} />
      Change Peer Group
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
  const relativePresenceTooltip = (
    <>
      <div>{getString('global-ui-relative-presence-tooltip')}</div>
      <EquationContainer>
        <div>It is calculated as:</div>
        <Division>
          <Top>employment share of industry in city</Top>
          <Bottom>employment share of industry in peer group</Bottom>
        </Division>
      </EquationContainer>
    </>
  );
  const absolutePresenceTooltip = (
    <>
      <div>{getString('global-ui-absolute-presence-tooltip')}</div>
      <EquationContainer>
        <div>It is calculated as:</div>
        <Subtraction>
          (employment share of industry in city) - (employment share of industry in peer group)
        </Subtraction>
      </EquationContainer>
    </>
  );
  const presenceButtons = togglePresence ? (
    <>
      <Tooltip
        explanation={relativePresenceTooltip}
      >
        <ToggleButton
          style={highlight === Highlighted.relative ? highlightedStyles : undefined}
          onClick={onButtonClick ? () => onButtonClick(Highlighted.relative) : undefined}
        >
          <Tooltip
            explanation={relativePresenceTooltip}
          />
          {getString('global-ui-relative-presence')}
        </ToggleButton>
      </Tooltip>
      <Tooltip
        explanation={absolutePresenceTooltip}
      >
        <ToggleButton
          style={highlight === Highlighted.absolute ? highlightedStyles : undefined}
          onClick={onButtonClick ? () => onButtonClick(Highlighted.absolute) : undefined}
        >
          <Tooltip
            explanation={absolutePresenceTooltip}
          />
          {getString('global-ui-absolute-presence')}
        </ToggleButton>
      </Tooltip>
    </>
  ) : (
    <Tooltip
      explanation={relativePresenceTooltip}
    >
      <Button>
        <Tooltip
          explanation={relativePresenceTooltip}
        />
        { getString('global-ui-relative-presence') }
      </Button >
    </Tooltip >
  );

  const arrowLeft = showArrows ? '←' : null;
  const arrowRight = showArrows ? '→' : null;

  const oneTimeTooltip = showOverviewTooltip ? (
    <OneTimeTooltip>
      Hover on labels to learn more. Click on <BenchmarkText /> to select a different benchmark.<br />
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
