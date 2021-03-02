export const defaultYear = 2020;

export function numberWithCommas(x: number | string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const ranges = [
  { divider: 1e18 , suffix: 'E' },
  { divider: 1e15 , suffix: 'P' },
  { divider: 1e12 , suffix: 'T' },
  { divider: 1e9 , suffix: 'B' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' },
];

export const formatNumber = (n: number) => {
  for (const range of ranges) {
    if (n >= range.divider) {
      return parseFloat((n / range.divider).toFixed(1)) + range.suffix;
    }
  }
  return n.toString();
};

const rangesLong = [
  { divider: 1e18 , suffix: 'quintillion' },
  { divider: 1e15 , suffix: 'quadrillion' },
  { divider: 1e12 , suffix: 'trillion' },
  { divider: 1e9 , suffix: 'billion' },
  { divider: 1e6 , suffix: 'million' },
  { divider: 1e3 , suffix: 'thousand' },
];

export const formatNumberLong = (n: number) => {
  for (const range of rangesLong) {
    if (n >= range.divider) {
      return parseFloat((n / range.divider).toFixed(1)) + ' ' + range.suffix;
    }
  }
  return n.toString();
};
