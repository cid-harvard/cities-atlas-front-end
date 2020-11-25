import React from 'react';
import styled from 'styled-components/macro';
import Tooltip, {TooltipTheme} from '../../components/general/Tooltip';
import {secondaryFont} from '../styleUtils';

const Root = styled.small`
  opacity: 0.5;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const KeywordText = styled.div`
  font-family: ${secondaryFont};
`;


const KeywordElement = ({text, theme}: {text: string, theme: TooltipTheme}) => {
  return (
    <Tooltip
      explanation={<KeywordText>{text}</KeywordText>}
      delay={500}
      theme={theme}
    >
      <Root>
        {text}
      </Root>
    </Tooltip>
  );
};

export default (theme: TooltipTheme) => (match: string[], rest: string[]) => {
  if (match.length > 1 || rest.length > 1) {
    const text = `Includes ${[...match, ...rest].join(', ')}`;
    return <KeywordElement text={text} theme={theme} />;
  } else {
    return null;
  }
};
