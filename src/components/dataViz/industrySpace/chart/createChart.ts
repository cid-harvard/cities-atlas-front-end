import * as d3 from 'd3';
import {
  getAspectRatio,
  drawPoint,
  getBounds,
  wrap,
  ellipsisText,
} from './Utils';
import {rgba} from 'polished';
import {LayoutData, lowIntensityNodeColor} from './useLayoutData';
import {getStandardTooltip} from '../../../../utilities/rapidTooltip';
import svgPathReverse from 'svg-path-reverse';
import {SuccessResponse} from './useRCAData';
import {intensityColorRange} from '../../../../styling/styleUtils';

const minExpectedScreenSize = 1020;

const minZoom = 0.75;
const maxZoom = 50;
export const innerRingRadius = 32;
export const outerRingRadius = 60;

export const svgRingModeClassName = 'svg-ring-mode-class';

export enum ZoomLevel {
  Cluster = 'cluster',
  Node = 'node',
}

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
  onNodeHover: (naicsId: string | undefined) => void;
  onZoomLevelChange: (zoomLevel: ZoomLevel) => void;
}

interface State {
  zoom: number;
  zoomLevel: ZoomLevel;
  active: any | null;
  hoveredShape: any | null;
  hoveredNode: any | null;
  externalHoveredId: string | undefined;
}

const defaultNodeRadius = 4.5;

const createChart = (input: Input) => {
  const {
    rootEl, data, rootWidth, rootHeight, backButton, tooltipEl, onNodeSelect, onZoomLevelChange,
    onNodeHover,
  } = input;

  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRatio({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = smallerSize / minExpectedScreenSize;
  const textAndSpacingSize = 3 * radiusAdjuster;
  const radius = defaultNodeRadius * radiusAdjuster;


  const state: State = {
    zoom: 1,
    zoomLevel: ZoomLevel.Cluster,
    active: null,
    hoveredShape: null,
    hoveredNode: null,
    externalHoveredId: undefined,
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
    svg.attr('class', '');
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
    if (datum && datum.id) {
      onNodeHover(datum.id);
    } else {
      onNodeHover(undefined);
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
    .attr('startOffset', '25%')
    .text('High Proximity');

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
    .attr('startOffset', '25%')
    .text('Highest Proximity');

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

  const nodeOpacity = state.zoom < 5 ? 0.75 : 1;
  const nodes = g.selectAll('.industry-node')
    .data(data.nodes)
    .enter().append('circle')
      .attr('class', 'industry-node')
      .attr('cx', d => xScale(d.x) + margin.left )
      .attr('cy', d => yScale(d.y) + margin.top )
      .attr('r', radius)
      .attr('fill', '#fff')
      .style('opacity', nodeOpacity)
      .style('--true-fill-color', d => d.color)
      .on('click', zoomToPoint as (d: any) => void)
      .on('mousemove', d => {
        const continent = data.clusters.continents.find(c => c.clusterId === d.continent);
        const country = data.clusters.countries.find(c => c.clusterId === d.country);
        const rows = [
          ['NAICS Code:', d.code ? d.code : ''],
          ['Community Level 1:', continent ? continent.name : ''],
          ['Community Level 2:', country ? country.name : ''],
          ['Sector:', d.sectorName],
        ];
        if (d.rca !== undefined) {
          rows.push(['RCA:', d.rca.toFixed(3)]);
        }
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name ? d.name : '',
          color: rgba(d.industryColor, 0.3),
          rows,
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
      .style('font-size', textAndSpacingSize * 7.5 + 'px')
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
      .style('font-size', textAndSpacingSize * 4 + 'px')
      .text(d => d.name);

  const nodeLabels = g.append('g')
    .attr('class', 'industry-nodes-label-group');

  nodeLabels.selectAll('.industry-nodes-label')
    .data(data.nodes)
    .enter().append('text')
      .attr('class', 'industry-nodes-label')
      .attr('x', d => xScale(d.x) + margin.left)
      .attr('y', d => yScale(d.y) + margin.top + (radius * 1.45))
      .style('font-size', textAndSpacingSize * 0.55 + 'px')
      .text(d => ellipsisText(d.name as string, 20));

  nodeLabels
    .style('display', 'none');

  function zoomToPoint(d: any, _external?: boolean) {
    // @ts-ignore
    if (state.active !== null && (state.active.element.node() === this ||
        (state.active.datum && state.active.datum.id === d.id)) ) {
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
    for (let i = 0; i < 15; i++) {
      const radiusCoords = drawPoint(outerRingRadius, i, 15, centerX, centerY);
      allXValues.push(radiusCoords.x);
      allYValues.push(radiusCoords.y);
    }

    const {translate, scale} = getBounds(
      allXValues,
      allYValues,
      width * 1.25,
      height * 1.25,
      outerWidth,
      outerHeight,
      7,
    );

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

    svg.attr('class', svgRingModeClassName);

    onNodeSelect(state.active.datum.id);
  }

  const setHighlightedPoint = (id: string | undefined) => {
    if (id === undefined) {
      reset();
    } else {
      const target = data.nodes.findIndex(d => d.id === id);
      if (target !== -1 && (state.active === null || state.active.datum.id !== id)
      ) {
        zoomToPoint(data.nodes[target], true);
      }
    }
  };

  const setExternalHoveredId = (id: string | undefined) => {
    state.externalHoveredId = id;
    nodes
      .attr('stroke', d => d.id === state.externalHoveredId ? '#333' : null)
      .attr('stroke-width', d => d.id === state.externalHoveredId ? 0.5 : null);
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

  function render(skipRingTransition?: boolean) {
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
        .duration(skipRingTransition ? 0 : 300)
        .style('opacity', 1);
      innerRing
        .attr('cx', centerX)
        .attr('cy', centerY)
        .style('opacity', 0)
        .transition()
        .duration(skipRingTransition ? 0 : 300)
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
        .attr('r', d => d.id === state.active.datum.id ||
          edgeData.find((e: {id: string}) => e.id === d.id) ? radius * 1.5 : radius)
        .style('display', d => d.id === state.active.datum.id ||
          edgeData.find((e: {id: string}) => e.id === d.id) ? 'block' : 'none')
        .attr('fill', d => d.color)
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
            d.adjustedCoords.y + Math.max(radius * 2.5, 6.5)
            : yScale(d.y) + margin.top + Math.max(radius * 2.5, 6.5),
          )
          .style('pointer-events', 'none')
          .style('font-size', Math.min(4, Math.max(radius * 1.1, 3.4)) + 'px')
          .text(d => ellipsisText(d.name as string, 30))
          .call(wrap, Math.max(radius * 14, 32), radius * 2)
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
      if (state.zoomLevel === ZoomLevel.Cluster) {
        state.zoomLevel = ZoomLevel.Node;
        onZoomLevelChange(ZoomLevel.Node);
      }
    } else {
      nodes
        .each((d: any) => d.adjustedCoords = undefined)
        .style('display', 'block')
        .style('pointer-events', state.zoom > 2.25  ? 'auto' : 'none')
        .style('opacity', () => {
          if (state.zoom < 2.5) {
            return 0.5;
          } else if (state.zoom < 3.5) {
            return 0.75;
          } else {
            return 1;
          }
        })
        .attr('fill', d => state.zoom < 3.5 ? '#fff' : d.color)
        .attr('r', radius)
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
        .attr('fill', d => state.zoom < 3.5 ? d.color : rgba(d.color, 0))
        .attr('stroke', rgba('#efefef', zoomScales.continent.stroke(state.zoom)))
        .style('opacity', 1);

      countries
        .style('pointer-events', zoomScales.countries.fill(state.zoom) > 0.01 ? 'auto' : 'none')
        .attr('fill', d => state.zoom < 3.5 && state.zoom > 1.5 ? d.color : rgba(d.color, 0))
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

      if (state.zoom > 3.5) {
        if (state.zoomLevel === ZoomLevel.Cluster) {
          state.zoomLevel = ZoomLevel.Node;
          onZoomLevelChange(ZoomLevel.Node);
        }
      } else {
        if (state.zoomLevel === ZoomLevel.Node) {
          state.zoomLevel = ZoomLevel.Cluster;
          onZoomLevelChange(ZoomLevel.Cluster);
        }
      }

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
          .attr('fill', state.hoveredNode.color)
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

  function update(newData: SuccessResponse) {
    const continentsData = newData.clusterRca.filter(d => d.level === 1);
    const countriesData = newData.clusterRca.filter(d => d.level === 2);

    const intensityColorScaleContinents = d3.scaleLog()
      .domain(d3.extent(continentsData.map(c => c.rcaNumCompany ? c.rcaNumCompany : 0.0001)) as [number, number])
      .range(intensityColorRange as any)
      .base(2);

    const intensityColorScaleCountries = d3.scaleLog()
      .domain(d3.extent(countriesData.map(c => c.rcaNumCompany ? c.rcaNumCompany : 0.0001)) as [number, number])
      .range(intensityColorRange as any)
      .base(2);

    continents.each(d => {
      const newDatum = newData.clusterRca.find(({clusterId}) => d.clusterId === clusterId);
      if (newDatum && newDatum.rcaNumCompany !== null) {
        d.color = intensityColorScaleContinents(newDatum.rcaNumCompany) as unknown as string;
      }
    });

    countries.each(d => {
      const newDatum = newData.clusterRca.find(({clusterId}) => d.clusterId === clusterId);
      if (newDatum && newDatum.rcaNumCompany !== null) {
        d.color = intensityColorScaleCountries(newDatum.rcaNumCompany) as unknown as string;
      }
    });

    nodes.each(d => {
      const newDatum = newData.nodeRca.find(({naicsId}) => d.id === naicsId);
      if (newDatum && newDatum.rcaNumCompany !== null) {
        d.color = newDatum.rcaNumCompany >= 1 ? d.industryColor : lowIntensityNodeColor;
        d.rca = newDatum.rcaNumCompany;
      }
    })
    .style('--true-fill-color', d => d.color);


    render(true);
  }

  return {render, reset, zoomIn, zoomOut, setHighlightedPoint, setExternalHoveredId, update};

};

export default createChart;
