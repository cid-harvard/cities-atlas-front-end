import React from "react";
import styled from "styled-components/macro";
import useQueryParams from "../../../hooks/useQueryParams";
import useFluent from "../../../hooks/useFluent";
import {
  DigitLevel,
  defaultDigitLevel,
  defaultCompositionType,
} from "../../../types/graphQL/graphQLTypes";
import {
  defaultClusterMode,
  ColorBy,
  CityColorBy,
  defaultNodeSizing,
  NodeSizing,
  defaultCityNodeSizing,
  defaultAggregationMode,
} from "../../../routing/routes";
import { SettingsOptions } from "./index";
import upperFirst from "lodash/upperFirst";

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
  const { settingsOptions } = props;

  const params = useQueryParams();
  const getString = useFluent();

  const compositionText =
    settingsOptions.compositionType !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-numbers-based-on")}</Subtitle>
        <em>
          {params.composition_type
            ? params.composition_type
            : defaultCompositionType}
        </em>
      </Segment>
    ) : null;

  const aggregationText =
    settingsOptions.aggregationMode !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-aggregation-mode")}</Subtitle>
        <em>
          {upperFirst(
            params.aggregation ? params.aggregation : defaultAggregationMode,
          )}
        </em>
      </Segment>
    ) : null;

  const detailLevel =
    settingsOptions.digitLevel !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-detail-level")}</Subtitle>
        <em>
          {params.digit_level
            ? params.digit_level
            : typeof settingsOptions.digitLevel === "object" &&
                settingsOptions.digitLevel.sixDigitOnlyMessage
              ? DigitLevel.Six
              : defaultDigitLevel}{" "}
          {getString("global-ui-digit-level")}
        </em>
      </Segment>
    ) : null;

  const clusterLevel =
    settingsOptions.clusterLevel !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-cluster-level")}</Subtitle>
        <em>
          {getString("global-ui-cluster-aggregation-level", {
            cluster:
              "cluster_" + params.cluster_overlay
                ? params.cluster_overlay
                : defaultDigitLevel,
          })}
        </em>
      </Segment>
    ) : null;

  const hideClusters =
    settingsOptions.clusterOverlayMode !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-show-clusters")}</Subtitle>
        <em>
          {params.cluster_overlay ? params.cluster_overlay : defaultClusterMode}
        </em>
      </Segment>
    ) : null;

  let nodeSizingValue: NodeSizing | undefined;
  if (
    typeof settingsOptions.nodeSizing !== "object" &&
    params.node_sizing === NodeSizing.rca
  ) {
    nodeSizingValue = defaultNodeSizing;
  } else if (
    typeof settingsOptions.nodeSizing === "object" &&
    settingsOptions.nodeSizing.rca &&
    !params.node_sizing
  ) {
    nodeSizingValue = NodeSizing.rca;
  } else {
    nodeSizingValue = !params.node_sizing
      ? defaultNodeSizing
      : params.node_sizing;
  }
  const sizeBy =
    settingsOptions.nodeSizing !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-node-sizing")}</Subtitle>
        <em>
          {getString("global-formatted-size-by", { type: nodeSizingValue })}
        </em>
      </Segment>
    ) : null;

  const defaultColorByText =
    settingsOptions.clusterLevel !== undefined ? "Cluster" : ColorBy.sector;
  const colorBy =
    settingsOptions.colorBy !== undefined ? (
      <Segment>
        <Subtitle>
          {typeof settingsOptions.colorBy === "object" &&
          settingsOptions.colorBy.nodes
            ? getString("global-ui-node-color-by")
            : getString("global-ui-color-by")}
        </Subtitle>
        <em>{params.color_by ? params.color_by : defaultColorByText}</em>
      </Segment>
    ) : null;

  const citySizeBy =
    settingsOptions.cityNodeSizing !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-node-sizing")}</Subtitle>
        <em>
          {getString("global-formatted-size-by", {
            type: params.city_node_sizing
              ? params.city_node_sizing
              : defaultCityNodeSizing,
          })}
        </em>
      </Segment>
    ) : null;

  const cityColorBy =
    settingsOptions.cityColorBy !== undefined ? (
      <Segment>
        <Subtitle>{getString("global-ui-node-color-by")}</Subtitle>
        <em>
          {upperFirst(
            params.city_color_by ? params.city_color_by : CityColorBy.proximity,
          )}
        </em>
      </Segment>
    ) : null;

  const rcaThreshold =
    settingsOptions.rcaThreshold !== undefined ? (
      <Segment>
        <Subtitle>RCA Threshold</Subtitle>
        <em>{params.rca_threshold !== undefined ? params.rca_threshold : 1}</em>
      </Segment>
    ) : null;

  return (
    <Root>
      <Title>{getString("global-ui-change-settings")}</Title>
      <Segment>
        <em>{getString("global-ui-current-settings")}</em>
      </Segment>
      {compositionText}
      {aggregationText}
      {detailLevel}
      {clusterLevel}
      {hideClusters}
      {sizeBy}
      {colorBy}
      {rcaThreshold}
      {cityColorBy}
      {citySizeBy}
    </Root>
  );
};

export default CurrentSettingsTooltip;
