import React from "react";
import styled from "styled-components";
import useFluent from "../../../../hooks/useFluent";
import {
  CityNodeSizing,
  defaultCityNodeSizing,
} from "../../../../routing/routes";
import { baseColor, primaryFont } from "../../../../styling/styleUtils";
import queryString from "query-string";
import useQueryParams from "../../../../hooks/useQueryParams";
import { useHistory } from "react-router-dom";
import googleAnalyticsEvent from "../../../../components/analytics/googleAnalyticsEvent";

const Root = styled.div`
  padding: 0.35rem 0.75rem 1rem;
`;

const SelectRoot = styled.div`
  position: relative;

  &::after {
    content: "";
    box-sizing: border-box;
    border-color: ${baseColor} transparent transparent;
    border-style: solid;
    border-width: 5px 5px 2.5px;
    display: inline-block;
    height: 0px;
    width: 0px;
    position: absolute;
    right: 0.7rem;
    top: 0;
    bottom: 0;
    margin: auto;
    pointer-events: none;
  }
`;

const Select = styled.select`
  height: 2.2rem;
  background-color: transparent;
  border-radius: 0;
  border: solid 1px ${baseColor};
  color: ${baseColor};
  width: 100%;
  font-family: ${primaryFont};
  padding: 0 10px;
  font-size: 1rem;
  -moz-appearance: none; /* Firefox */
  -webkit-appearance: none; /* Safari and Chrome */
  appearance: none;
`;

const Settings = () => {
  const getString = useFluent();
  const params = useQueryParams();
  const history = useHistory();
  const nodeSizing = params.city_node_sizing
    ? params.city_node_sizing
    : defaultCityNodeSizing;

  const updateSetting = (param: string, value: string | number) => {
    const query = queryString.stringify({ ...params, [param]: value });
    const newUrl = query
      ? history.location.pathname + "?" + query
      : history.location.pathname;
    googleAnalyticsEvent("Viz Options", param, `${value}`);
    history.push(newUrl);
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSetting("city_node_sizing", e.target.value);
  };

  return (
    <Root>
      <SelectRoot>
        <Select onChange={onChange} value={nodeSizing}>
          <option value={CityNodeSizing.population}>
            {getString("global-formatted-size-by", {
              type: CityNodeSizing.population,
            })}
          </option>
          <option value={CityNodeSizing.gdpPpp}>
            {getString("global-formatted-size-by", {
              type: CityNodeSizing.gdpPpp,
            })}
          </option>
          <option value={CityNodeSizing.uniform}>
            {getString("global-formatted-size-by", {
              type: CityNodeSizing.uniform,
            })}
          </option>
        </Select>
      </SelectRoot>
    </Root>
  );
};

export default Settings;
