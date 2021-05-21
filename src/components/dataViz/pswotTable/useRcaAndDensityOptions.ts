import useQueryParams from '../../../hooks/useQueryParams';
import THRESHOLD_DATA from './thresholds.json';
import {
  DigitLevel,
  defaultDigitLevel,
  CompositionType,
  defaultCompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {
  ClusterLevel,
  defaultClusterLevel,
  AggregationMode,
  defaultAggregationMode,
} from '../../../routing/routes';

export const rcaOptions = [
  {label: 'Very High', value: 'Very High'},
  {label: 'High', value: 'High'},
  {label: 'Expected', value: 'Expected'},
  {label: 'Low', value: 'Low'},
  {label: 'Very Low', value: 'Very Low'},
  {label: 'None', value: 'None'},
];
export const densityOptions = [
  {label: 'Very High', value: 'Very High'},
  {label: 'High', value: 'High'},
  {label: 'Expected', value: 'Expected'},
  {label: 'Low', value: 'Low'},
  {label: 'Very Low', value: 'Very Low'},
];

const useRcaAndDensityOptions = () => {
  const {composition_type, digit_level, cluster_level, aggregation} = useQueryParams();
  const compositionType = composition_type ? composition_type as CompositionType : defaultCompositionType;
  const aggregationType = aggregation ? aggregation as AggregationMode : defaultAggregationMode;
  const digitLevel = digit_level ? parseInt(digit_level, 10) as DigitLevel : defaultDigitLevel;
  const clusterLevel = cluster_level ? cluster_level as ClusterLevel : defaultClusterLevel;
  const match = (value: number, metric: 'rca' | 'density', values: string[]) => {
    const threshold = THRESHOLD_DATA.find(d => {
      if (d.metric === metric) {
        if ((compositionType === CompositionType.Companies && d.var === 'company') ||
            (compositionType === CompositionType.Employees && d.var === 'employ')) {
          if (aggregationType === AggregationMode.industries && d.classification === 'naics') {
            if (d.level === digitLevel) {
              return true;
            }
          }
          if (aggregationType === AggregationMode.cluster && d.classification === 'cluster') {
            if (d.level.toString() === clusterLevel) {
              return true;
            }
          }
        }
      }
      return false;
    });
    if (!values.length) {
      return true;
    }
    if (threshold) {
      if (values.includes('Very High')) {
        if (value >= threshold.high_split) {
          return true;
        }
      }
      if (values.includes('High')) {
        if (value > threshold.expected_high && value < threshold.high_split) {
          return true;
        }
      }
      if (values.includes('Expected')) {
        if (value >= threshold.expected_low && value <= threshold.expected_high) {
          return true;
        }
      }
      if (values.includes('Low')) {
        if (value < threshold.expected_low && value > threshold.low_split) {
          return true;
        }
      }
      if (values.includes('Very Low')) {
        if (value > 0 && value <= threshold.low_split) {
          return true;
        }
      }
    }
    if (metric === 'rca' && values.includes('None')) {
      if (value === 0) {
        return true;
      }
    }
    return false;
  };
  return {match};
};

export default useRcaAndDensityOptions;
