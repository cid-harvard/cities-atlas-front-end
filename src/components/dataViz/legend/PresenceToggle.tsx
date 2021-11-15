import React from 'react';
import useFluent from '../../../hooks/useFluent';
import styled from 'styled-components';
import { benchmarkColor, lightBorderColor, primaryFont } from '../../../styling/styleUtils';
import Tooltip from '../../general/Tooltip';

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

const BenchmarkLegend = (props: Props) => {
  const {
    togglePresence, highlight, showArrows,
  } = props;
  const getString = useFluent();
  const highlightedStyles: React.CSSProperties = {
    backgroundColor: lightBorderColor,
    borderColor: benchmarkColor,
  };
  const presenceButtons = togglePresence ? (
    <>
      <Tooltip
        explanation={getString('global-ui-relative-presence')}
      >
        <ToggleButton style={highlight === Highlighted.relative ? highlightedStyles : undefined}>
          <Tooltip
            explanation={getString('global-ui-relative-presence')}
          />
          {getString('global-ui-relative-presence')}
        </ToggleButton>
      </Tooltip>
      <Tooltip
        explanation={getString('global-ui-absolute-presence')}
      >
        <ToggleButton style={highlight === Highlighted.absolute ? highlightedStyles : undefined}>
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
  return (
    <Root>
      {arrowLeft}
        <ButtonsRoot>
          {presenceButtons}
        </ButtonsRoot>
      {arrowRight}
    </Root>
  );
};

export default BenchmarkLegend;
