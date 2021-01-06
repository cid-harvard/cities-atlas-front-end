import {extent} from 'd3-array';
import {select} from 'd3-selection';

export const intensityLegendClassName = 'intensity-legend-class-name';
export const sectorLegendClassName = 'sector-legend-class-name';

interface Ratio {
  w: number;
  h: number;
}

export const getAspectRatio = (aspect: Ratio, actual: Ratio, buffer: number) => {
  const longerAspectSide = aspect.w > aspect.h ? 'width' : 'height';
  const smallerActualValue = (actual.w > actual.h ? actual.h : actual.w) - (buffer * 2);
  const ratio = longerAspectSide === 'width' ? aspect.h / aspect.w : aspect.w / aspect.h;
  const width = longerAspectSide === 'width' ? smallerActualValue : smallerActualValue * ratio;
  const height = longerAspectSide === 'height' ? smallerActualValue : smallerActualValue * ratio;
  const margin = {
    left: ((actual.w - width) / 2) + (buffer / 2), right: ((actual.w - width) / 2) + (buffer / 2),
    top: ((actual.h - height) / 2) + (buffer / 2), bottom: ((actual.h - height) / 2) + (buffer / 2),
  };
  return {
    width, height, margin,
    outerWidth: actual.w,
    outerHeight: actual.h,
  };
};

export function drawPoint(
  r: number, currentPoint: number, totalPoints: number, centerX: number, centerY: number,
) {

  const theta = ((Math.PI*2) / totalPoints);
  const angle = (theta * currentPoint);

  const x = (r * Math.cos(angle) + centerX);
  const y = (r * Math.sin(angle) + centerY);

  return {x, y};
}

export const getBounds = (
  xValues: number[], yValues: number[],
  innerWidth: number, innerHeight: number,
  outerWidth: number, outerHeight: number, maxZoom: number,
) => {
  const xBounds = extent(xValues) as [number, number];
  const yBounds = extent(yValues) as [number, number];
  const bounds = [
    [xBounds[0], yBounds[0]],
    [xBounds[1], yBounds[1]],
  ];
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.max(1, Math.min(maxZoom, 0.9 / Math.max(dx / innerWidth, dy / innerHeight)));
  const translate = [outerWidth / 2 - scale * x, outerHeight / 2 - scale * y];

  return {translate, scale};
};

export const ellipsisText = (text: string, maxChar: number) => {
  if (text.trim().length < maxChar + 3) {
    return text;
  } else {
    return text.slice(0, maxChar) + '...';
  }
};

export function wrap(text: any, width: number, height: number) {
  text.each(function() {
    // @ts-ignore
    const t = select(this);
    // @ts-ignore
    const words = t.text().split(/\s+/).reverse();
    let word = words.pop();
    let line: any[] = [];
    let lineNumber = 0; //<-- 0!
    const lineHeight = 1.2; // ems
    const x = t.attr('x'); //<-- include the x!
    const y = t.attr('y');
    const dy = t.attr('dy') ? t.attr('dy') : 0; //<-- null check
    let tspan = t.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
    while (word !== undefined) {
      line.push(word);
      tspan.text(line.join(' '));
      const node = tspan.node();
      if (node && node.getComputedTextLength() > (width * 0.8)) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        // @ts-ignore
        tspan = t.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
      word = words.pop();
    }
    if (t.node().getBBox().width > width || t.node().getBBox().height > height * 0.8) {
      t.attr('opacity', '0');
    }
  });
}
