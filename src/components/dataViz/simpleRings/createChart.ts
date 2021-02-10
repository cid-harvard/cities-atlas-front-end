import svgPathReverse from 'svg-path-reverse';
import {
  getAspectRatio,
  drawPoint,
  ellipsisText,
} from '../industrySpace/chart/Utils';
import * as d3 from 'd3';
import {
  primaryColorLight,
} from '../../../styling/styleUtils';

const minExpectedScreenSize = 1020;
const defaultNodeRadius = 30;
function circlePath(cx: number, cy: number, r: number){
    return svgPathReverse.reverse(
      'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0',
    );
}

interface Node {
  primary: boolean;
  id: string;
  name: string;
  color: string;
  proximity: number;
  radius?: number;
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
    rootEl, data, rootWidth, rootHeight,
  } = input;

  const {
    width, height, outerWidth, outerHeight,
  } = getAspectRatio({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = smallerSize / minExpectedScreenSize;
  const radius = defaultNodeRadius * radiusAdjuster;

  const innerRingRadius = 340 * radiusAdjuster;
  const outerRingRadius = 590 * radiusAdjuster;
  const baseFontSize = 32 * radiusAdjuster;

  const centerX = outerWidth / 2;
  const centerY = outerHeight / 2;


  const nodes: NodeWithCoords[] = data.nodes.map((d, i) => {
    if (d.primary) {
      return {
        ...d,
        x: centerX,
        y: centerY,
      };
    } else {
      const innerCircleLength = data.nodes.length - 1 < 7 ? data.nodes.length - 1 : 7;
      const {x, y} = drawPoint(
        i < 7 ? innerRingRadius : outerRingRadius,
        i < 7 ? i : i - 7 - 1,
        i < 7 ? innerCircleLength : data.nodes.length - 7 - 1,
        centerX,
        centerY,
      );
      return {
        ...d,
        x, y,
      };
    }
  });

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
    .text('Medium Proximity')
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
    .text('High Proximity')
    .style('font-size', baseFontSize * 1.25 + 'px')
    .style('font-weight', '600')
    .style('text-transform', 'uppercase')
    .style('fill', primaryColorLight)
    .style('pointer-events', 'none');

  g.selectAll('.industry-node')
    .data(nodes)
    .enter().append('circle')
      .attr('class', 'industry-node')
      .attr('cx', d => d.x )
      .attr('cy', d => d.y )
      .attr('r', d => d.radius ? d.radius : radius)
      .attr('fill', d => d.color ? d.color : 'gray');

  const nodeLabels = g.append('g')
    .attr('class', 'industry-nodes-label-group');

  nodeLabels.selectAll('.industry-nodes-label')
    .data(nodes)
    .enter().append('text')
      .attr('class', 'industry-nodes-label')
      .style('font-size', baseFontSize * 0.9 + 'px')
      .style('fill', '#444')
      .style('paint-order', 'stroke')
      .style('text-anchor', 'middle')
      .text(d => ellipsisText(d.name as string, 30))
      .attr('x', d => d.x)
      .attr('y', d => d.y + (d.radius ? d.radius : radius) * 2.25);

};

export default createChart;
