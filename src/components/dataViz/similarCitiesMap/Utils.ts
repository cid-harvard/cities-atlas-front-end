import {
  scaleThreshold,
} from 'd3-scale';

export const proximityColors = [
   '#E3260E',
   '#F99600',
   '#F9E202',
   '#47C774',
   '#2E8CB9',
];

export const createProximityScale = (values: [number, number, number, number]) => {
  const scale: (val: number) => string = scaleThreshold()
    .domain(values)
    .range(proximityColors as any[]) as any;
  return scale;
};
