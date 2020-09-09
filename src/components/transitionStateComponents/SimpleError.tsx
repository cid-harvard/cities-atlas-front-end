import React from 'react';
import useFluent from '../../hooks/useFluent';
import styled from 'styled-components/macro';

const Root = styled.div`
  font-style: italic;
  opacity: 0.75;
  font-size: 0.8rem;
  padding: 0.5rem;
`;

export default ({fluentMessageId}: {fluentMessageId?: string}) => {
  const getString = useFluent();
  const message = fluentMessageId ? getString(fluentMessageId) : getString('global-ui-basic-data-error');
  return <Root>{message}</Root>;
};
