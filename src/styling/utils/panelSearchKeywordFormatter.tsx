import React from 'react';
import styled from 'styled-components/macro';
import Tooltip, {TooltipTheme} from '../../components/general/Tooltip';
import {secondaryFont} from '../styleUtils';
import useFluent from '../../hooks/useFluent';

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


const KeywordElement = ({keywords, theme}: {keywords: string, theme: TooltipTheme}) => {
  const getString = useFluent();
  const text = getString('global-ui-includes-keywords', {keywords});
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
    const keywords = [...match, ...rest].join(', ');
    return <KeywordElement keywords={keywords} theme={theme} />;
  } else {
    return null;
  }
};
