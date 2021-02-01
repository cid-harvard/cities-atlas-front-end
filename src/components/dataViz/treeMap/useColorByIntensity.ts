import useRCAData from '../../../hooks/useRCAData';
import {
  DigitLevel,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {ColorBy} from '../../../routing/routes';
import {scaleSymlog} from 'd3-scale';
import {extent} from 'd3-array';
import {intensityColorRange} from '../../../styling/styleUtils';

interface Input {
  digitLevel: DigitLevel;
  colorBy: ColorBy;
  compositionType: CompositionType;
}

const useColorByIntensity = (input: Input) => {
  const {digitLevel, colorBy, compositionType} = input;

  const {loading, error, data} = useRCAData(digitLevel);

  if (colorBy === ColorBy.intensity && data !== undefined) {
    const minMax = compositionType === CompositionType.Employees
      ? extent(data.nodeRca.map(c => c.rcaNumEmploy ? c.rcaNumEmploy : 0)) as [number, number]
      : extent(data.nodeRca.map(c => c.rcaNumCompany ? c.rcaNumCompany : 0)) as [number, number];
    const intensityColorScale = scaleSymlog()
      .domain(minMax)
      .range(intensityColorRange as any) as unknown as (value: number) => string;
    return {
      loading,
      industries: data.nodeRca.map(c => {
        const value = compositionType === CompositionType.Employees
          ? (c.rcaNumEmploy ? c.rcaNumEmploy : 0)
          : (c.rcaNumCompany ? c.rcaNumCompany : 0);
        return {
          ...c,
          fill: intensityColorScale(value),
        };
      }),
    };
  }

  return {loading, error, industries: undefined};
};

export default useColorByIntensity;