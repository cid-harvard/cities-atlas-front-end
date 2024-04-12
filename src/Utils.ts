export const defaultYear = 2024;
export const populationDisplayYear = 2024;
export const gdpPerCapitaDisplayYear = 2024;
export const rankingDisplayYear = 2024;

export function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const ranges = [
  { divider: 1e18, suffix: "E" },
  { divider: 1e15, suffix: "P" },
  { divider: 1e12, suffix: "T" },
  { divider: 1e9, suffix: "B" },
  { divider: 1e6, suffix: "M" },
  { divider: 1e3, suffix: "k" },
];

export const formatNumber = (n: number, decimalPlaces?: number) => {
  const fixedRange = decimalPlaces !== undefined ? decimalPlaces : 1;
  for (const range of ranges) {
    if (n >= range.divider) {
      return parseFloat((n / range.divider).toFixed(fixedRange)) + range.suffix;
    }
  }
  return decimalPlaces !== undefined ? n.toFixed(decimalPlaces) : n.toString();
};

const rangesLong = [
  { divider: 1e18, suffix: "quintillion" },
  { divider: 1e15, suffix: "quadrillion" },
  { divider: 1e12, suffix: "trillion" },
  { divider: 1e9, suffix: "billion" },
  { divider: 1e6, suffix: "million" },
  { divider: 1e3, suffix: "thousand" },
];

export const formatNumberLong = (n: number) => {
  for (const range of rangesLong) {
    if (n >= range.divider) {
      return parseFloat((n / range.divider).toFixed(1)) + " " + range.suffix;
    }
  }
  return n.toString();
};

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

export const decimalToFraction = function (decimal: number) {
  let top: number | string = decimal.toString().replace(/\d+[.]/, "");
  const bottom: number = Math.pow(10, top.length);
  if (decimal > 1) {
    top = +top + Math.floor(decimal) * bottom;
  }
  const x = gcd(top as number, bottom);
  return {
    top: (top as number) / x,
    bottom: bottom / x,
    display: (top as number) / x + ":" + bottom / x,
  };
};

export function filterOutliers(arr: number[]) {
  // Copy the values, rather than operating on references to existing values
  const values = arr.concat();

  // Then sort
  values.sort(function (a, b) {
    return a - b;
  });

  /* Then find a generous IQR. This is generous because if (values.length / 4)
   * is not an int, then really you should average the two elements on either
   * side to find q1.
   */
  const q1 = values[Math.floor(values.length / 4)];
  // Likewise for q3.
  const q3 = values[Math.ceil(values.length * (3 / 4))];
  const iqr = q3 - q1;

  // Then find min and max values
  const maxValue = q3 + iqr * 1.5;
  const minValue = q1 - iqr * 1.5;

  // Then filter anything beyond or beneath these values.
  const filteredValues = values.filter(function (x) {
    return x <= maxValue && x >= minValue;
  });

  // Then return
  return filteredValues;
}

export const defaultCityPool = [
  196, // Albuquerque
  323, // Dallas
  1346, // Belo Horizonte
  14, // Los Angeles
  1656, // Dublin
  1214, // Novo Hamburgo
  362, // Calgary
  11498, // Singapore
  6893, // Jaipur
  12964, // Tokyo
  2463, // Zurich
  12578, // Wenzhou
  2046, // Paris
  11136, // Hanoi
  6845, // Mumbai
  6955, // Delhi
  2559, // Milan
  880, // Baltimore
  875, // Toronto
  2167, // Amsterdam
];
