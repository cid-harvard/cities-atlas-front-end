import * as d3 from 'd3';
import {
  getAspectRatio,
  drawPoint,
  getBounds,
  wrap,
  // intensityLegendClassName,
  // sectorLegendClassName,
  ellipsisText,
} from './Utils';
import {rgba, lighten} from 'polished';
import {LayoutData} from './useLayoutData';
import {getStandardTooltip} from '../../../../utilities/rapidTooltip';
import svgPathReverse from 'svg-path-reverse';

const minExpectedScreenSize = 1020;

const minZoom = 0.75;
const maxZoom = 50;
export const innerRingRadius = 24;
export const outerRingRadius = 48;

function circlePath(cx: number, cy: number, r: number){
    return svgPathReverse.reverse(
      'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0',
    );
}

const zoomScales = {
  continent: {
    fill: d3.scaleLinear()
      .domain([1, 3])
      .range([1, 0]),
    stroke: d3.scaleLinear()
      .domain([1, maxZoom])
      .range([1, 1]),
    label: d3.scaleLinear()
      .domain([1, 1.85, 2.15])
      .range([1, 1, 0]),
  },
  countries: {
    fill: d3.scaleLinear()
      .domain([1.5, 2, 3, 4, 7, 8])
      .range([0, 0.5, 0.75, 0.3, 0.1, 0]),
    stroke: d3.scaleLinear()
      .domain([1.2, 2, 5, 12, maxZoom])
      .range([0, 0.5, 1, 0.75, 0.2]),
    label: d3.scaleLinear()
      .domain([1.45, 1.75, 3.65, 4])
      .range([0, 1, 1, 0]),
  },
  nodes: {
    fill: d3.scaleLinear()
      .domain([0, 2, 2.55, 3.5])
      .range([0, 0.2, 0.75, 1]),
    label: d3.scaleLinear()
      .domain([8, 9])
      .range([0, 1]),
  },
};

interface Input {
  rootEl: HTMLDivElement;
  data: LayoutData;
  rootWidth: number;
  rootHeight: number;
  backButton: HTMLButtonElement;
  tooltipEl: HTMLDivElement;
  onNodeSelect: (naicsId: string | undefined) => void;
}

interface State {
  zoom: number;
  active: any | null;
  hoveredShape: any | null;
  hoveredNode: any | null;
}

const createChart = (input: Input) => {
  const {rootEl, data, rootWidth, rootHeight, backButton, tooltipEl, onNodeSelect} = input;

  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRatio({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = smallerSize / minExpectedScreenSize;
  let radius = 2.5;
  radius = radius < 2.5 ? 2.5 * radiusAdjuster : radius * radiusAdjuster;

  // const sectorLegend = legendEl.querySelector('.' + sectorLegendClassName);
  // const intensityLegend = legendEl.querySelector('.' + intensityLegendClassName);

  const state: State = {
    zoom: 1,
    active: null,
    hoveredShape: null,
    hoveredNode: null,
  };

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

  const zoom = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .on('zoom', zoomed);

  svg.call(zoom);

  function zoomed() {
    state.zoom = d3.event.transform.k;
    g.attr('transform', d3.event.transform);
    render();
  }

  function clearActive() {
    state.active = null;
    clearActiveLabels();
    onNodeSelect(undefined);
  }

  function zoomIn() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive();
    zoom.scaleBy(svg.transition().duration(250), 1.4);
    svg.call(zoom);
    render();
  }

  function zoomOut() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive();
    zoom.scaleBy(svg.transition().duration(250), 0.6);
    svg.call(zoom);
    render();
  }

  function reset() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive();
    svg.transition()
      .duration(300)
      .call(zoom.transform, d3.zoomIdentity);
    svg.call(zoom);
    onNodeSelect(undefined);
    render();
  }

  function softReset(d: any) {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive();

    const {translate, scale} = getBounds(
      [xScale(d.x) + margin.left],
      [yScale(d.y) + margin.top],
      width, height, outerWidth, outerHeight, 7,
    );

    svg.call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
    svg.call(zoom);
    d.wasActive = true;
    render();
  }

  backButton.removeEventListener('click', reset);
  backButton.addEventListener('click', reset);

  function setHoveredShape(datum: any) {
    state.hoveredShape = datum;
    render();
  }

  function setHoveredNode(datum: any) {
    state.hoveredNode = datum;
    if (!state.active) {
      render();
    }
  }

  function clearActiveLabels() {
    g.selectAll('.industry-ring-label').remove();
  }

  const outerRing = g.append('circle')
    .attr('class', 'outer-ring');

  const innerRing = g.append('circle')
    .attr('class', 'inner-ring');

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
  const outerRingLabelPath = g.append('path')
    .attr('id', 'outerRingLabelPath') //Unique id of the path
    .style('fill', 'none')
    .style('stroke', 'none');

  //Create an SVG text element and append a textPath element
  g.append('text')
   .append('textPath') //append a textPath to the text element
    .attr('class', 'ring-label')
    .attr('xlink:href', '#outerRingLabelPath') //place the ID of the path here
    .style('text-anchor','middle')
    .attr('startOffset', '38%')
    .text('Low Proximity');

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
  const innerRingLabelPath = g.append('path')
    .attr('id', 'innerRingLabelPath') //Unique id of the path
    .style('fill', 'none')
    .style('stroke', 'none');

  //Create an SVG text element and append a textPath element
  g.append('text')
   .append('textPath') //append a textPath to the text element
    .attr('class', 'ring-label')
    .attr('xlink:href', '#innerRingLabelPath') //place the ID of the path here
    .style('text-anchor','middle')
    .attr('startOffset', '38%')
    .text('High Proximity');

  const continents = g.selectAll('.industry-continents')
    .data(data.clusters.continents)
    .enter().append('polygon')
      .attr('class', 'industry-continents')
      .attr('points', d =>
        d.polygon.map(([xCoord, yCoord]: [number, number]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' '),
      )
      .attr('fill', d => rgba(d.color, 1))
      .attr('stroke', rgba('#efefef', 1))
      .style('opacity', 1)
      .on('click', d => zoomToShape(d, 3))
      .on('mouseenter', d => setHoveredShape(d))
      .on('mouseleave', () => setHoveredShape(null));


  const countries = g.selectAll('.industry-countries')
    .data(data.clusters.countries)
    .enter().append('polygon')
      .attr('class', 'industry-countries')
      .attr('points', d =>
        d.polygon.map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' '),
      )
      .attr('fill', d => rgba(d.color, 0))
      .attr('stroke', rgba('#efefef', 0))
      .style('opacity', 1)
      .on('click', d => zoomToShape(d, 5))
      .on('mouseenter', d => setHoveredShape(d))
      .on('mouseleave', () => setHoveredShape(null));


  const hoveredShape = g.append('polygon')
    .attr('class', 'industry-cluster-hovered')
    .style('display', 'none');

  const nodeOpacity = zoomScales.nodes.fill(state.zoom);
  const nodes = g.selectAll('.industry-node')
    .data(data.nodes)
    .enter().append('circle')
      .attr('class', 'industry-node')
      .attr('cx', d => xScale(d.x) + margin.left )
      .attr('cy', d => yScale(d.y) + margin.top )
      .attr('r', radius)
      .attr('fill', '#fff')
      .style('opacity', nodeOpacity)
      .on('click', zoomToPoint as (d: any) => void)
      .on('mousemove', d => {
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name ? d.name : '',
          color: rgba(d.industryColor, 0.3),
          rows: [
            ['NAICS Code:', d.code ? d.code : ''],
          ],
          boldColumns: [1],
        });
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = d3.event.pageY + 'px';
        tooltipEl.style.left = d3.event.pageX + 'px';
      })
      .on('mouseenter', d => setHoveredNode(d))
      .on('mouseleave', () => {
        tooltipEl.style.display = 'none';
        setHoveredNode(null);
      });


  const hoveredNode = g.append('circle')
    .attr('class', 'industry-node-hovered')
    .style('display', 'none');

  const continentLabels = g.selectAll('.industry-continents-label')
    .data(data.clusters.continents)
    .enter().append('text')
      .attr('class', 'industry-continents-label')
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top)
      .style('font-size', radius * 8 + 'px')
      .text(d => d.name);

  const countryLabels = g.append('g')
    .attr('class', 'industry-countries-label-group')
    .style('display', 'none');

  countryLabels.selectAll('.industry-countries-label')
    .data(data.clusters.countries)
    .enter().append('text')
      .attr('class', 'industry-countries-label')
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top)
      .style('font-size', radius * 5 + 'px')
      .text(d => d.name);

  const nodeLabels = g.append('g')
    .attr('class', 'industry-nodes-label-group');

  nodeLabels.selectAll('.industry-nodes-label')
    .data(data.nodes)
    .enter().append('text')
      .attr('class', 'industry-nodes-label')
      .attr('x', d => xScale(d.x) + margin.left)
      .attr('y', d => yScale(d.y) + margin.top + (radius * 1.45))
      .style('font-size', radius * 0.5 + 'px')
      .text(d => ellipsisText(d.name as string, 20));

  nodeLabels
    .style('display', 'none');

  function zoomToPoint(d: any, external?: boolean) {
    // @ts-ignore
    if (state.active !== null && state.active.element.node() === this) {
      onNodeSelect(undefined);
      return softReset(d);
    }
    svg.on('.zoom', null);
    clearActiveLabels();
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    state.active = {};
    // @ts-ignore
    state.active.element = d3.select(this).classed('active', true);
    state.active.datum = d;

    const centerX = d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left;
    const centerY = d.adjustedCoords ? d.adjustedCoords.y : yScale(d.y) + margin.top;
    const allXValues = [centerX];
    const allYValues = [centerY];
    d.edges.forEach((_n: any, i: number) => {
      const radiusCoords = drawPoint(outerRingRadius, i, d.edges.length, centerX, centerY);
      allXValues.push(radiusCoords.x);
      allYValues.push(radiusCoords.y);
    });

    const {translate, scale} = getBounds(allXValues, allYValues, width, height, outerWidth, outerHeight, 7);

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

    if (!external) {
      onNodeSelect(state.active.datum.id);
    }
  }

  const setHighlightedPoint = (id: string | undefined) => {
    if (id === undefined) {
      reset();
    } else {
      const target = data.nodes.findIndex(d => d.id === id);
      if (target !== -1) {
        zoomToPoint(data.nodes[target], true);
      }
    }
  };

  function zoomToShape(d: any, maxZoomAllowed: number) {

    const allXValues: number[] = [];
    const allYValues: number[] = [];
    d.polygon.forEach(([xValue, yValue]: [number, number]) => {
      allXValues.push(xScale(xValue) + margin.left);
      allYValues.push(yScale(yValue) + margin.top);
    });

    const {translate, scale} = getBounds(allXValues, allYValues, outerWidth, outerHeight, outerWidth, outerHeight, maxZoomAllowed);

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
  }

  function render() {
    if (state.active) {
      const edgeData = state.active.datum.edges.map(({trg}: {trg: string}) => data.nodes.find(({id}) => id === trg));
      const centerX = state.active.datum.adjustedCoords ?
        state.active.datum.adjustedCoords.x : xScale(state.active.datum.x) + margin.left;
      const centerY = state.active.datum.adjustedCoords ?
        state.active.datum.adjustedCoords.y : yScale(state.active.datum.y) + margin.top;

      outerRing
        .attr('cx', centerX)
        .attr('cy', centerY)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1);
      innerRing
        .attr('cx', centerX)
        .attr('cy', centerY)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1);

      outerRingLabelPath
        .attr('d', circlePath(centerX, centerY, outerRingRadius + 3.5));

      innerRingLabelPath
        .attr('d', circlePath(centerX, centerY, innerRingRadius + 3.5));

      nodes
        .each(d => {
          const i = edgeData.findIndex((e: {id: string}) => e.id === d.id);
          if (i !== -1) {
            const innerCircleLength = edgeData.length < 7 ? edgeData.length : 7;
            const adjustedCoords = drawPoint(
              i < 7 ? innerRingRadius : outerRingRadius,
              i < 7 ? i : i - 7,
              i < 7 ? innerCircleLength : edgeData.length - 7,
              centerX,
              centerY,
            );
            (d as any).adjustedCoords = adjustedCoords;
          } else if (d.id !== state.active.datum.id) {
            (d as any).adjustedCoords = undefined;
          }
        })
        .style('pointer-events', 'auto')
        .style('opacity', 1)
        .style('display', d => d.id === state.active.datum.id ||
          edgeData.find((e: {id: string}) => e.id === d.id) ? 'block' : 'none')
        .attr('fill', d => d.industryColor)
        .transition()
        .ease(d3.easeCircleInOut)
        .duration(500)
        .attr('cx', d => (d as any).adjustedCoords ? (d as any).adjustedCoords.x : xScale((d as any).x) + margin.left)
        .attr('cy', d => (d as any).adjustedCoords ? (d as any).adjustedCoords.y : yScale((d as any).y) + margin.top);

      g.selectAll('.industry-ring-label')
        .data(data.nodes.filter(d => d.id === state.active.datum.id ||
          edgeData.find((e: {id: string}) => e.id === d.id)))
        .each(d => {
          const i = edgeData.findIndex((e: {id: string}) => e.id === d.id);
          if (i !== -1) {
            const innerCircleLength = edgeData.length < 7 ? edgeData.length : 7;
            const adjustedCoords = drawPoint(
              i < 7 ? innerRingRadius : outerRingRadius,
              i < 7 ? i : i - 7,
              i < 7 ? innerCircleLength : edgeData.length - 7,
              centerX,
              centerY,
            );
            (d as any).adjustedCoords = adjustedCoords;
          }
        })
        .enter().append('text')
          .attr('class', 'industry-ring-label')
          .attr('x', (d: any) => d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left)
          .attr('y', (d: any) => d.adjustedCoords ?
            d.adjustedCoords.y + Math.max(radius * 2, 4)
            : yScale(d.y) + margin.top + Math.max(radius * 2, 4),
          )
          .style('pointer-events', 'none')
          .style('font-size', Math.max(radius * 0.8, 2.25) + 'px')
          .text(d => ellipsisText(d.name as string, 60))
          .call(wrap, Math.max(radius * 14, 20), radius * 9)
          .style('opacity', 0)
          .transition()
          .delay(500)
          .duration(300)
          .style('opacity', 1);

      continents
        .style('pointer-events', 'none')
        .style('opacity', 0);

      countries
        .style('pointer-events', 'none')
        .style('opacity', 0);

      hoveredShape
        .style('display', 'none');

      hoveredNode
        .style('display', 'none');

      continentLabels
        .style('display', 'none');

      countryLabels
        .style('display', 'none');

      nodeLabels
        .style('display', 'none');

      state.active.element
        .style('display', 'block');

      backButton.style.display = 'block';
      // sectorLegend.style.display = 'block';
      // intensityLegend.style.display = 'none';
    } else {
      const zoomedNodeOpacity = zoomScales.nodes.fill(state.zoom);
      nodes
        .each((d: any) => d.adjustedCoords = undefined)
        .style('display', 'block')
        .style('pointer-events', zoomScales.nodes.fill(state.zoom) > 0.275 ? 'auto' : 'none')
        .style('opacity', zoomedNodeOpacity)
        .attr('fill', d => {
          if (state.zoom < 3) {
            return '#fff';
          } else if (state.zoom < 3.25) {
            return lighten(zoomScales.countries.fill(state.zoom) - 0.1, d.industryColor);
          } else if (state.zoom < 3.85) {
            return lighten(zoomScales.countries.fill(state.zoom) - 0.3, d.industryColor);
          } else {
            return d.industryColor;
          }
        })
        .transition()
        .ease(d3.easeCircleInOut)
        .duration((d: any) => {
          if (d.wasActive) {
            d.wasActive = undefined;
            return 0;
          } else {
            return 500;
          }
        })
        .attr('cx', d => xScale(d.x) + margin.left )
        .attr('cy', d => yScale(d.y) + margin.top );

      continents
        .style('pointer-events', zoomScales.continent.fill(state.zoom) > 0.1 ? 'auto' : 'none')
        .attr('fill', d => rgba(d.color, zoomScales.continent.fill(state.zoom)))
        .attr('stroke', rgba('#efefef', zoomScales.continent.stroke(state.zoom)))
        .style('opacity', 1);

      countries
        .style('pointer-events', zoomScales.countries.fill(state.zoom) > 0.01 ? 'auto' : 'none')
        .attr('fill', d => rgba(d.color, zoomScales.countries.fill(state.zoom)))
        .attr('stroke', rgba('#efefef', zoomScales.countries.stroke(state.zoom)))
        .style('opacity', 1);

      continentLabels
        .style('opacity', zoomScales.continent.label(state.zoom))
        .style('display', 'block');

      countryLabels
        .style('opacity', zoomScales.countries.label(state.zoom))
        .style('display', 'block');

      if (state.zoom > 8) {
        nodeLabels
          .style('opacity', zoomScales.nodes.label(state.zoom))
          .style('display', 'block');
      } else {
        nodeLabels
          .style('display', 'none');
      }

      if (state.zoom > 1.5) {
       backButton.style.display = 'block';
      } else {
       backButton.style.display = 'none';
      }

      // if (state.zoom > 3.5) {
      //   sectorLegend.style.display = 'block';
      //   intensityLegend.style.display = 'none';
      // } else {
      //   sectorLegend.style.display = 'none';
      //   intensityLegend.style.display = 'block';
      // }

      outerRing
        .style('opacity', 0);
      innerRing
        .style('opacity', 0);
      outerRingLabelPath
        .attr('d', '');
      innerRingLabelPath
        .attr('d', '');

      if (state.hoveredShape) {
        hoveredShape
          .attr('points', state.hoveredShape.polygon.map(([xCoord, yCoord]: [number, number]) =>
            [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' ') )
          .attr('fill', 'none')
          .attr('stroke', '#efefef')
          .attr('stroke-width', 3)
          .style('display', 'block');
      } else {
        hoveredShape
          .style('display', 'none');
      }
      if (state.hoveredNode) {
        hoveredNode
          .attr('cx', xScale(state.hoveredNode.x) + margin.left )
          .attr('cy', yScale(state.hoveredNode.y) + margin.top )
          .attr('fill', state.hoveredNode.industryColor)
          .attr('r', radius)
          .attr('stroke', state.zoom > 4 ? '#333' : '#efefef')
          .attr('stroke-width', radius < 2 ? 0.6 : 1)
          .style('display', 'block');
      } else {
        hoveredNode
          .style('display', 'none');
      }
    }
  }

  return {render, reset, zoomIn, zoomOut, setHighlightedPoint};

};

export default createChart;
