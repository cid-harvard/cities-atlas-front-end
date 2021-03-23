import React from 'react';
import styled from 'styled-components/macro';
import Tooltip, {TooltipTheme} from '../../components/general/Tooltip';
import {secondaryFont, baseColor} from '../styleUtils';
import useFluent from '../../hooks/useFluent';

const RootDark = styled.small`
  color: rgba(255, 255, 255, 0.5);
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  .panel-search-matched-keyword {
    color: #fff;
  }
`;

const RootLight = styled.small`
  color: rgba(0, 0, 0, 0.5);
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  .panel-search-matched-keyword {
    color: ${baseColor};
  }
`;

const KeywordText = styled.div`
  font-family: ${secondaryFont};
`;


const KeywordElement = ({keywords, theme, query}: {keywords: string, theme: TooltipTheme, query: string}) => {
  const safeQuery = new RegExp(query.replace(/[^\w\s]/gi, '').trim(), 'gi');
  const getString = useFluent();
  const text = getString('global-ui-includes-keywords', {keywords});
  const __html = getString('global-ui-includes-keywords', {keywords})
    .replace(safeQuery, (match: string) => `<strong class='panel-search-matched-keyword'>${match}</strong>`);
  const Root = theme === TooltipTheme.Dark ? RootDark : RootLight;
  return (
    <Tooltip
      explanation={<KeywordText>{text}</KeywordText>}
      delay={500}
      theme={theme}
    >
      <Root dangerouslySetInnerHTML={{__html}} />
    </Tooltip>
  );
};

export default (theme: TooltipTheme) => (match: string[], rest: string[], query: string) => {
  const total = match.length + rest.length;
  if (!(match.length === total && rest.length === 0) && !(rest.length === total && match.length === 0)) {
    const keywords = [...match, ...rest].join(', ');
    return <KeywordElement keywords={keywords} theme={theme} query={query} />;
  } else {
    return null;
  }
};
