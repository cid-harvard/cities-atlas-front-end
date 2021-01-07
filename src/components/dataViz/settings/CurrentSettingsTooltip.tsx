import React from 'react';
import styled from 'styled-components/macro';
import useQueryParams from '../../../hooks/useQueryParams';
import useFluent from '../../../hooks/useFluent';
import {
  defaultDigitLevel,
  defaultCompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {Toggle} from '../../../routing/routes';
import {SettingsOptions} from './index';

const Root = styled.div`
  text-align: center;
`;

const Title = styled.div`
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
`;

const Segment = styled.div`
  font-size: 0.7rem;
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  text-transform: capitalize;
`;

const Subtitle = styled.em`
  opacity: 0.55;
  font-size: 0.65rem;
`;

interface Props {
  settingsOptions: SettingsOptions;
}

const CurrentSettingsTooltip = (props: Props) => {
  const {settingsOptions} = props;

  const params = useQueryParams();
  const getString = useFluent();

  const compositionText = settingsOptions.compositionType !== undefined ? (
    <Segment>
      <Subtitle>{getString('global-ui-numbers-based-on')}</Subtitle>
      <em>{params.composition_type ? params.composition_type : defaultCompositionType}</em>
    </Segment>
  ) : null;

  const detailLevel = settingsOptions.digitLevel !== undefined ? (
    <Segment>
      <Subtitle>{getString('global-ui-detail-level')}</Subtitle>
      <em>{params.digit_level ? params.digit_level : defaultDigitLevel} {getString('global-ui-digit-level')}</em>
    </Segment>
  ) : null;

  const hideClusters = settingsOptions.hideClusterOverlay !== undefined ? (
    <Segment>
      <Subtitle>{getString('global-ui-show-clusters')}</Subtitle>
      <em>{params.hide_clusters ? params.hide_clusters : Toggle.On}</em>
    </Segment>
  ) : null;

  return (
    <Root>
      <Title>{getString('global-ui-change-settings')}</Title>
      <Segment>
        <em>{getString('global-ui-current-settings')}</em>
      </Segment>
      {compositionText}
      {detailLevel}
      {hideClusters}
    </Root>
  );
};

export default CurrentSettingsTooltip;
