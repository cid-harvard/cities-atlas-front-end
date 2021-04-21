import svgPathReverse from 'svg-path-reverse';
import {
  drawPoint,
  ellipsisText,
} from '../industrySpace/chart/Utils';
import * as d3 from 'd3';
import {
  primaryColorLight,
} from '../../../styling/styleUtils';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';

const minExpectedScreenSize = 1020;
export const defaultNodeRadius = 14;
function circlePath(cx: number, cy: number, r: number){
    return svgPathReverse.reverse(
      'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0',
    );
}

interface Ratio {
  w: number;
  h: number;
}

const getAspectRatio = (aspect: Ratio, actual: Ratio, buffer: number) => {
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

interface Node {
  primary: boolean;
  id: string;
  name: string;
  country: string;
  color: string;
  proximity: number;
  radius?: number;
  shown: boolean;
}

interface NodeWithCoords extends Node {
  x: number;
  y: number;
}

interface Data {
  nodes: Node[];
}

interface Input {
  rootEl: HTMLDivElement;
  data: Data;
  rootWidth: number;
  rootHeight: number;
  tooltipEl: HTMLDivElement;
}

const createChart = (input: Input) => {
  const {
    rootEl, data, rootWidth, rootHeight, tooltipEl,
  } = input;

  const {
    width, height, outerWidth, outerHeight,
  } = getAspectRatio({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = smallerSize / minExpectedScreenSize;
  const radius = defaultNodeRadius * radiusAdjuster;

  const innerRingRadius = 340 * radiusAdjuster;
  const outerRingRadius = 590 * radiusAdjuster;
  const baseFontSize = Math.min(Math.max(38 * radiusAdjuster, 12), 18);

  const centerX = outerWidth / 2;
  const centerY = outerHeight / 2;

  const highNodesDatum: Node[] = [];
  const mediumNodesDatum: Node[] = [];
  const primary = data.nodes.find(d => d.primary);
  if (primary) {
    highNodesDatum.push(primary);
  }
  const filtered = data.nodes.filter(d => d.shown && !d.primary);
  filtered.slice(0, 20).forEach((d, i) => {
    if (i < 10) {
      highNodesDatum.push(d);
    } else {
      mediumNodesDatum.push(d);
    }
  });

  const highNodes = highNodesDatum.map((d, i) => {
    if (d.primary) {
      return {
        ...d,
        x: centerX,
        y: centerY,
      };
    } else {
      const innerCircleLength = highNodesDatum.length - 1;
      const {x, y} = drawPoint(
        innerRingRadius,
        i,
        innerCircleLength,
        centerX,
        centerY,
      );
      return {
        ...d,
        x, y,
      };
    }
  });

  const mediumNodes = mediumNodesDatum.map((d, i) => {
    if (d.primary) {
      return {
        ...d,
        x: centerX,
        y: centerY,
      };
    } else {
      const {x, y} = drawPoint(
        outerRingRadius,
        i,
        mediumNodesDatum.length,
        centerX,
        centerY,
      );
      return {
        ...d,
        x, y,
      };
    }
  });

  const nodes: NodeWithCoords[] = [...highNodes, ...mediumNodes];

  const svg = d3.select(rootEl).append('svg')
  .attr('width',  outerWidth)
  .attr('height', outerHeight);

  const g = svg.append('g');

  // OUTER RING
  g.append('circle')
    .attr('class', 'outer-ring')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('fill', 'none')
    .attr('stroke', '#bfbfbf')
    .attr('stroke-width', '0.5')
    .attr('r', outerRingRadius + 'px');

  // INNER RING
  g.append('circle')
    .attr('class', 'inner-ring')
    .attr('class', 'outer-ring')
    .attr('fill', 'none')
    .attr('stroke', '#bfbfbf')
    .attr('stroke-width', '0.5')
    .attr('r', innerRingRadius + 'px')
    .attr('cx', centerX)
    .attr('cy', centerY);

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
  // OUTER RING TEXT PATH
  g.append('path')
    .attr('id', 'outerRingLabelPath') //Unique id of the path
    .style('fill', 'none')
    .style('stroke', 'none')
    .attr('d', circlePath(centerX, centerY, outerRingRadius + (baseFontSize * 1.5)));

  //Create an SVG text element and append a textPath element
  // OUTER RING TEXT
  g.append('text')
   .append('textPath') //append a textPath to the text element
    .attr('class', 'ring-label')
    .attr('xlink:href', '#outerRingLabelPath') //place the ID of the path here
    .style('text-anchor','middle')
    .attr('startOffset', '25%')
    .text('Lower Similarity')
    .style('font-size', baseFontSize * 1.25 + 'px')
    .style('font-weight', '600')
    .style('text-transform', 'uppercase')
    .style('fill', primaryColorLight)
    .style('pointer-events', 'none');

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
  // INNER RING TEXT PATH
  g.append('path')
    .attr('id', 'innerRingLabelPath') //Unique id of the path
    .style('fill', 'none')
    .style('stroke', 'none')
    .attr('d', circlePath(centerX, centerY, innerRingRadius + (baseFontSize * 1.5)));

  //Create an SVG text element and append a textPath element
  // INNER RING TEXT
  g.append('text')
   .append('textPath') //append a textPath to the text element
    .attr('class', 'ring-label')
    .attr('xlink:href', '#innerRingLabelPath') //place the ID of the path here
    .style('text-anchor','middle')
    .attr('startOffset', '25%')
    .text('Higher Similarity')
    .style('font-size', baseFontSize * 1.25 + 'px')
    .style('font-weight', '600')
    .style('text-transform', 'uppercase')
    .style('fill', primaryColorLight)
    .style('pointer-events', 'none');

  g.selectAll('.city-node')
    .data(nodes)
    .enter().append('circle')
      .attr('class', 'city-node')
      .attr('cx', d => d.x )
      .attr('cy', d => d.y )
      .attr('r', d => d.radius ? d.radius : radius)
      .attr('fill', d => d.color ? d.color : 'gray')
      .attr('display', d => d.shown ? 'block' : 'none')
      .on('mousemove', d => {
        const rows = !d.primary ? [
          ['Distance:', d.proximity ? d.proximity.toFixed(2) : ''],
        ] : [];
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name + ', ' + d.country,
          color: rgba(d.color, 0.3),
          rows,
          boldColumns: [1],
        });
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = d3.event.pageY + 'px';
        tooltipEl.style.left = d3.event.pageX + 'px';
      })
      .on('mouseleave', () => {
        tooltipEl.style.display = 'none';
      });

  const nodeLabels = g.append('g')
    .attr('class', 'city-nodes-label-group');

  let maxCharLength = 8;
  if (window.innerHeight > 700 && window.innerWidth > 1200) {
    maxCharLength = 15;
  } else if (window.innerHeight > 600) {
    maxCharLength = 10;
  }

  nodeLabels.selectAll('.city-nodes-label')
    .data(nodes)
    .enter().append('text')
      .attr('class', 'city-nodes-label')
      .style('font-size', baseFontSize * 0.9 + 'px')
      .style('fill', '#444')
      .style('paint-order', 'stroke')
      .style('text-anchor', 'middle')
      .attr('display', d => d.shown ? 'block' : 'none')
      .text(d => ellipsisText(d.name as string, maxCharLength))
      .attr('x', d => d.x)
      .attr('y', d => d.y + (d.radius ? d.radius : radius) + (baseFontSize * 1.25));

};

export default createChart;
