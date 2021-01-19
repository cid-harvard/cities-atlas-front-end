import * as d3 from 'd3';
import {
  getAspectRatio,
} from '../Utils';
import {rgba} from 'polished';
import {SuccessResponse} from '../useRCAData';
import {LayoutData} from '../useLayoutData';
import {intensityColorRange} from '../../../../../styling/styleUtils';

interface Input {
  rootEl: HTMLDivElement;
  data: LayoutData;
  rootWidth: number;
  rootHeight: number;
}

const createChart = (input: Input) => {
  const {
    rootEl, data, rootWidth, rootHeight,
  } = input;

  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRatio({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, -5);

  const svg = d3.select(rootEl).append('svg')
    .attr('width',  outerWidth)
    .attr('height', outerHeight);

  const xScale = d3.scaleLinear()                // interpolator for X axis -- inner plot region
    .domain(d3.extent(data.nodes, ({x}) => x) as [number, number])
    .range([0, width]);

  const yScale = d3.scaleLinear()                // interpolator for Y axis -- inner plot region
    .domain(d3.extent(data.nodes, ({y}) => y) as [number, number])
    .range([height, 0]);

  const g = svg.append('g');


  const continents = g.selectAll('.industry-continents')
    .data(data.clusters.continents)
    .enter().append('polygon')
      .attr('class', 'industry-continents')
      .attr('points', d =>
        d.polygon.map(([xCoord, yCoord]: [number, number]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' '),
      )
      .attr('fill', d => d.color)
      .attr('stroke', rgba('#efefef', 1))
      .attr('stroke-width', 1.5);

  g.selectAll('.industry-countries')
    .data(data.clusters.countries)
    .enter().append('polygon')
      .attr('class', 'industry-countries')
      .attr('points', d =>
        d.polygon.map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' '),
      )
      .attr('fill', 'none')
      .attr('stroke', rgba('#efefef', 0.75))
      .attr('stroke-width', 0.75);

  g.selectAll('.industry-continents-label')
    .data(data.clusters.continents)
    .enter().append('text')
      .attr('class', 'industry-continents-label')
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top)
      .style('font-size', '6.5px')
      .style('font-weight', '600')
      .style('text-transform', 'uppercase')
      .style('text-anchor', 'middle')
      .text(d => d.name);

  const node = g.append('circle')
      .attr('class', 'industry-node')
      .attr('r', 5)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.75);

  function render(nodeId: string | undefined) {
    const targetNode = data.nodes.find(n => n.id === nodeId);
    if (targetNode) {
      node
        .style('display', 'block')
        .attr('fill', targetNode.industryColor)
        .attr('cx', xScale(targetNode.x) + margin.left )
        .attr('cy', yScale(targetNode.y) + margin.top );
    }
  }

  function update(nodeId: string | undefined, newData: SuccessResponse) {
    const intensityColorScale = d3.scaleLinear()
      .domain(d3.extent(newData.clusterRca.map(c => c.rcaNumCompany ? c.rcaNumCompany : 0)) as [number, number])
      .range(intensityColorRange as any);

    continents.each(d => {
      const newDatum = newData.clusterRca.find(({clusterId}) => d.clusterId === clusterId);
        if (newDatum && newDatum.rcaNumCompany !== null) {
          d.color = intensityColorScale(newDatum.rcaNumCompany) as unknown as string;
        }
      })
    .attr('fill', d => d.color);

    render(nodeId);
  }

  return {render, update};

};

export default createChart;
