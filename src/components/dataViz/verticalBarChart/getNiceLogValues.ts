/* tslint:disable:no-bitwise no-conditional-assignment */
const niceLogValues = (value: number) => {
  let logValue = 2;
  let numberOfXAxisTicks = 3;
  // eslint-disable-next-line
  while (value >>= 1) {
    logValue <<= 1;
  }
  if (logValue <= 8) {
    // 8 = 3
    logValue = 8;
    numberOfXAxisTicks = 3;
  } else if (logValue <= 16) {
    // 16 = 4
    logValue = 16;
    numberOfXAxisTicks = 4;
  } else if (logValue <= 32) {
    // 32 = 5
    logValue = 32;
    numberOfXAxisTicks = 5;
  } else if (logValue <= 64) {
    // 64 = 3
    logValue = 64;
    numberOfXAxisTicks = 3;
  } else if (logValue <= 128) {
    // 128 = 7
    logValue = 128;
    numberOfXAxisTicks = 7;
  } else if (logValue <= 256) {
    // 256 = 4
    logValue = 256;
    numberOfXAxisTicks = 4;
  } else if (logValue <= 512) {
    // 512 = 3
    logValue = 512;
    numberOfXAxisTicks = 3;
  } else if (logValue <= 1024) {
    // 1024 = 5
    logValue = 1024;
    numberOfXAxisTicks = 5;
  }
  return {logValue, numberOfXAxisTicks};
};

export const tickMarksForMinMax = (min: number, max: number) => {
  const digits = min.toString().length + max.toString().length;
  return digits - 3;
};

export default niceLogValues;