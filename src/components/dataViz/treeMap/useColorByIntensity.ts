import useRCAData from '../../../hooks/useRCAData';
import {
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {ColorBy} from '../../../routing/routes';
import {scaleSymlog} from 'd3-scale';
import {extent} from 'd3-array';
import {intensityColorRange} from '../../../styling/styleUtils';

interface Input {
  digitLevel: DigitLevel;
  colorBy: ColorBy;
}

const useColorByIntensity = (input: Input) => {
  const {digitLevel, colorBy} = input;

  const {loading, error, data} = useRCAData(digitLevel);

  if (colorBy === ColorBy.intensity && data !== undefined) {
    const minMax = extent(data.naicsRca.map(c => c.rca ? c.rca : 0)) as [number, number];
    const intensityColorScale = scaleSymlog()
      .domain(minMax)
      .range(intensityColorRange as any) as unknown as (value: number) => string;
    return {
      loading,
      industries: data.naicsRca.map(c => {
        const value = c.rca ? c.rca : 0;
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