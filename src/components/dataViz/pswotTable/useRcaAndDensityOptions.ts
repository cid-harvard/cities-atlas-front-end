import useQueryParams from "../../../hooks/useQueryParams";
import THRESHOLD_DATA from "./thresholds.json";
import {
  DigitLevel,
  defaultDigitLevel,
  CompositionType,
  defaultCompositionType,
} from "../../../types/graphQL/graphQLTypes";
import {
  ClusterLevel,
  defaultClusterLevel,
  AggregationMode,
  defaultAggregationMode,
} from "../../../routing/routes";

const RCA_OPTIONS_BASE = [
  { label: "Very High", value: "Very High" },
  { label: "High", value: "High" },
  { label: "Expected", value: "Expected" },
  { label: "Low", value: "Low" },
  { label: "Very Low", value: "Very Low" },
  { label: "None", value: "None" },
];
const DENSITY_OPTIONS_BASE = [
  { label: "Very High", value: "Very High" },
  { label: "High", value: "High" },
  { label: "Expected", value: "Expected" },
  { label: "Low", value: "Low" },
  { label: "Very Low", value: "Very Low" },
];

export const formatNumber = (value: number) => {
  if (value > 1 || value < -1) {
    return parseFloat(value.toFixed(2));
  } else if (value === 0) {
    return value;
  } else {
    const numberOfZerosAfterDecimal = Math.abs(
      Math.floor(Math.log10(Math.abs(value)) + 1),
    );
    // console.log(value);
    // console.log(numberOfZerosAfterDecimal);
    // return parseFloat(value.toFixed(2));
    return parseFloat(value.toFixed(numberOfZerosAfterDecimal + 2));
  }
};

const useRcaAndDensityOptions = () => {
  const { composition_type, digit_level, cluster_level, aggregation } =
    useQueryParams();
  const compositionType = composition_type
    ? (composition_type as CompositionType)
    : defaultCompositionType;
  const aggregationType = aggregation
    ? (aggregation as AggregationMode)
    : defaultAggregationMode;
  const digitLevel = digit_level
    ? (parseInt(digit_level, 10) as DigitLevel)
    : defaultDigitLevel;
  const clusterLevel = cluster_level
    ? (cluster_level as ClusterLevel)
    : defaultClusterLevel;
  const findThreshold = (metric: "rca" | "density") =>
    THRESHOLD_DATA.find((d) => {
      if (d.metric === metric) {
        if (
          (compositionType === CompositionType.Companies &&
            d.var === "company") ||
          (compositionType === CompositionType.Employees && d.var === "employ")
        ) {
          if (
            aggregationType === AggregationMode.industries &&
            d.classification === "naics"
          ) {
            if (d.level === digitLevel) {
              return true;
            }
          }
          if (
            aggregationType === AggregationMode.cluster &&
            d.classification === "cluster"
          ) {
            if (d.level.toString() === clusterLevel) {
              return true;
            }
          }
        }
      }
      return false;
    });
  const rcaThreshold = findThreshold("rca");
  const densityThreshold = findThreshold("density");
  const match = (
    value: number,
    metric: "rca" | "density",
    values: string[],
  ) => {
    const threshold = metric === "density" ? densityThreshold : rcaThreshold;
    if (!values.length) {
      return true;
    }
    if (threshold) {
      if (values.includes("Very High")) {
        if (value >= threshold.high_split) {
          return true;
        }
      }
      if (values.includes("High")) {
        if (value > threshold.expected_high && value < threshold.high_split) {
          return true;
        }
      }
      if (values.includes("Expected")) {
        if (
          value >= threshold.expected_low &&
          value <= threshold.expected_high
        ) {
          return true;
        }
      }
      if (values.includes("Low")) {
        if (value < threshold.expected_low && value > threshold.low_split) {
          return true;
        }
      }
      if (values.includes("Very Low")) {
        if (
          (metric === "density" || value > 0) &&
          value <= threshold.low_split
        ) {
          return true;
        }
      }
    }
    if (metric === "rca" && values.includes("None")) {
      if (value === 0) {
        return true;
      }
    }
    return false;
  };
  const rcaOptions = RCA_OPTIONS_BASE.map((d) => {
    let label: string = d.label;
    if (rcaThreshold) {
      if (d.value === "Very High") {
        label = label + ` (n ≥ ${formatNumber(rcaThreshold.high_split)})`;
      }
      if (d.value === "High") {
        label =
          label +
          ` (n > ${formatNumber(rcaThreshold.expected_high)} & n < ${formatNumber(rcaThreshold.high_split)})`;
      }
      if (d.value === "Expected") {
        label =
          label +
          ` (n ≥ ${formatNumber(rcaThreshold.expected_low)} & n ≤ ${formatNumber(rcaThreshold.expected_high)})`;
      }
      if (d.value === "Low") {
        label =
          label +
          ` (n < ${formatNumber(rcaThreshold.expected_low)} & n > ${formatNumber(rcaThreshold.low_split)})`;
      }
      if (d.value === "Very Low") {
        label =
          label + ` (n ≤ ${formatNumber(rcaThreshold.low_split)} & n > 0)`;
      }
      if (d.value === "None") {
        label = label + ` (n = 0)`;
      }
    }
    return {
      label,
      value: d.value,
    };
  });
  const densityOptions = DENSITY_OPTIONS_BASE.map((d) => {
    let label: string = d.label;
    if (rcaThreshold) {
      if (d.value === "Very High") {
        label = label + ` (n ≥ ${formatNumber(rcaThreshold.high_split)})`;
      }
      if (d.value === "High") {
        label =
          label +
          ` (n > ${formatNumber(rcaThreshold.expected_high)} & n < ${formatNumber(rcaThreshold.high_split)})`;
      }
      if (d.value === "Expected") {
        label =
          label +
          ` (n ≥ ${formatNumber(rcaThreshold.expected_low)} & n ≤ ${formatNumber(rcaThreshold.expected_high)})`;
      }
      if (d.value === "Low") {
        label =
          label +
          ` (n < ${formatNumber(rcaThreshold.expected_low)} & n > ${formatNumber(rcaThreshold.low_split)})`;
      }
      if (d.value === "Very Low") {
        label = label + ` (n ≤ ${formatNumber(rcaThreshold.low_split)})`;
      }
    }
    return {
      label,
      value: d.value,
    };
  });
  return { match, rcaOptions, densityOptions };
};

export default useRcaAndDensityOptions;
