export const tickMarksForMinMax = (min: number, max: number) => {
  const digits = min.toString().length + max.toString().length;
  return digits - 3;
};
