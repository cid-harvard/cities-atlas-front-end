import * as d3 from 'd3';
import {
  getAspectRatio,
  drawPoint,
  getBounds,
  wrap,
  ellipsisText,
} from './Utils';
import {defaultYear, formatNumber} from '../../../../Utils';
import {rgba} from 'polished';
import {LayoutData, lowIntensityNodeColor} from './useLayoutData';
import {getStandardTooltip} from '../../../../utilities/rapidTooltip';
import svgPathReverse from 'svg-path-reverse';
import {SuccessResponse} from './useRCAData';
import {intensityColorRange} from '../../../../styling/styleUtils';
import {
  NodeSizing,
  ColorBy,
} from '../../../../routing/routes';

const minExpectedScreenSize = 1020;

const minZoom = 0.75;
const maxZoom = 50;
export const innerRingRadius = 32;
export const outerRingRadius = 60;

export const svgRingModeClassName = 'svg-ring-mode-class';

export enum ZoomLevel {
  Cluster1 = 'cluster1',
  Cluster2 = 'cluster2',
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

export enum NodeAction {
  ZoomIn = 'zoomin',
  ZoomOut = 'zoomout',
  Reset = 'reset',
  SoftReset = 'softreset',
  SelectNode = 'selectnode',
  ExternalSelect = 'externalselectnode',
}

interface Input {
  rootEl: HTMLDivElement;
  data: LayoutData;
  rootWidth: number;
  rootHeight: number;
  breadCrumbCluster1Button: HTMLButtonElement;
  breadCrumbCluster2Button: HTMLButtonElement;
  breadCrumbNodeButton: HTMLButtonElement;
  tooltipEl: HTMLDivElement;
  onNodeSelect: (naicsId: string | undefined, action: NodeAction) => void;
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
    rootEl, data, rootWidth, rootHeight, tooltipEl, onNodeSelect, onZoomLevelChange,
    onNodeHover, breadCrumbCluster1Button, breadCrumbCluster2Button, breadCrumbNodeButton,
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
    zoomLevel: ZoomLevel.Cluster1,
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

  function clearActive(clear: boolean, action: NodeAction) {
    state.active = null;
    clearActiveLabels();
    if (clear) {
      onNodeSelect(undefined, action);
    }
    svg.attr('class', '');
  }

  function zoomIn() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
      onNodeSelect(undefined, NodeAction.ZoomIn);
    }
    clearActive(false, NodeAction.ZoomIn);
    zoom.scaleBy(svg.transition().duration(250), 1.4);
    svg.call(zoom);
    render();
  }

  function zoomOut() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
      onNodeSelect(undefined, NodeAction.ZoomOut);
    }
    clearActive(false, NodeAction.ZoomOut);
    zoom.scaleBy(svg.transition().duration(250), 0.6);
    svg.call(zoom);
    render();
  }

  function reset() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive(true, NodeAction.Reset);
    svg.transition()
      .duration(300)
      .call(zoom.transform, d3.zoomIdentity);
    svg.call(zoom);
    onNodeSelect(undefined, NodeAction.Reset);
    render();
  }

  function resetToClusterMid() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive(true, NodeAction.Reset);
    if (state.zoomLevel !== ZoomLevel.Cluster2) {
      zoom.scaleTo(svg.transition().duration(250), 2.25);
    }
    svg.call(zoom);
    onNodeSelect(undefined, NodeAction.Reset);
    render();
  }

  function resetToNode() {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive(true, NodeAction.Reset);
    if (state.zoomLevel !== ZoomLevel.Node) {
      zoom.scaleTo(svg.transition().duration(250), 3.65);
    }
    svg.call(zoom);
    onNodeSelect(undefined, NodeAction.Reset);
    render();
  }

  function softReset(d: any) {
    if (state.active !== null) {
      state.active.element.classed('active', false);
    }
    clearActive(true, NodeAction.SoftReset);

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

  breadCrumbCluster1Button.removeEventListener('click', reset);
  breadCrumbCluster1Button.addEventListener('click', reset);

  breadCrumbCluster2Button.removeEventListener('click', resetToClusterMid);
  breadCrumbCluster2Button.addEventListener('click', resetToClusterMid);

  breadCrumbNodeButton.removeEventListener('click', resetToNode);
  breadCrumbNodeButton.addEventListener('click', resetToNode);

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
    .text('Medium Proximity');

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
    .text('High Proximity');

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
      .on('mousemove', d => {
        const continent = data.clusters.continents.find(c => c.clusterId === d.continent);
        const rows = [
          ['Year:', defaultYear.toString()],
          ['High Aggregation<br />Knowledge Cluster:', continent ? continent.name : ''],
        ];
        if (d.numEmploy !== undefined) {
          rows.push(['Number of Employees:', formatNumber(Math.round(d.numEmploy))]);
        }
        if (d.shareEmploy !== undefined) {
          rows.push(['Share of Employees:', d.shareEmploy + '%']);
        }
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name ? d.name : '',
          color: 'gray',
          rows,
          boldColumns: [1],
          simple: true,
          additionalHTML:
            `<div style="padding: 0.35rem; font-style: italic; font-size: 0.7rem; text-align: center;">
              Click to zoom into knowledge cluster
            </div>`,
        });
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = d3.event.pageY + 'px';
        tooltipEl.style.left = d3.event.pageX + 'px';
      })
      .on('mouseleave', () => {
        tooltipEl.style.display = 'none';
        setHoveredShape(null);
      });

  const continents = g.selectAll('.industry-continents')
    .data(data.clusters.continents)
    .enter().append('polygon')
      .attr('class', 'industry-continents')
      .attr('points', d =>
        d.polygon.map(([xCoord, yCoord]: [number, number]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(',')).join(' '),
      )
      .attr('fill', d => rgba(d.color, 0))
      .attr('stroke', rgba('#efefef', 1))
      .style('opacity', 1)
      .on('click', d => zoomToShape(d, 3))
      .on('mouseenter', d => setHoveredShape(d))
      .on('mousemove', d => {
        const rows = [
          ['Year:', defaultYear.toString()],
        ];
        if (d.numEmploy !== undefined) {
          rows.push(['Number of Employees:', formatNumber(Math.round(d.numEmploy))]);
        }
        if (d.shareEmploy !== undefined) {
          rows.push(['Share of Employees:', d.shareEmploy + '%']);
        }
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name ? d.name : '',
          color: 'gray',
          rows,
          boldColumns: [1],
          simple: true,
          additionalHTML:
            `<div style="padding: 0.35rem; font-style: italic; font-size: 0.7rem; text-align: center;">
              Click to zoom into knowledge cluster
            </div>`,
        });
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = d3.event.pageY + 'px';
        tooltipEl.style.left = d3.event.pageX + 'px';
      })
      .on('mouseleave', () => {
        tooltipEl.style.display = 'none';
        setHoveredShape(null);
      });

  const hoveredShape = g.append('polygon')
    .attr('class', 'industry-cluster-hovered')
    .style('display', 'none');

  const nodeOpacity = state.zoom < 5 ? 0.5 : 0.75;
  const nodes = g.selectAll('.industry-node')
    .data(data.nodes)
    .enter().append('circle')
      .attr('class', 'industry-node')
      .attr('cx', d => xScale(d.x) + margin.left )
      .attr('cy', d => yScale(d.y) + margin.top )
      .attr('r', d => d.radius ? d.radius : radius)
      .attr('fill', '#fff')
      .style('opacity', nodeOpacity)
      .style('--true-fill-color', d => d.color)
      .on('click', d => zoomToPoint(d, false))
      .on('mousemove', d => {
        const continent = data.clusters.continents.find(c => c.clusterId === d.continent);
        const country = data.clusters.countries.find(c => c.clusterId === d.country);
        const rows = [
          ['NAICS Code:', d.code ? d.code : ''],
          ['Year:', defaultYear.toString()],
          ['High Aggregation<br />Knowledge Cluster:', continent ? continent.name : ''],
          ['Low Aggregation<br />Knowledge Cluster:', country ? country.name : ''],
        ];
        if (d.rca !== undefined) {
          rows.push(['Relative Presence:', d.rca.toFixed(3)]);
        }
        const clickText = state.active && state.active.datum && state.active.datum.id === d.id
          ? 'Click to zoom out'
          : 'Click to see related industries';
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.name ? d.name : '',
          color: rgba(d.industryColor, 0.3),
          rows,
          boldColumns: [1],
          additionalHTML:
            `<div style="padding: 0.35rem; font-style: italic; font-size: 0.7rem; text-align: center;">
              ${clickText}
            </div>`,
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
      .style('font-size', textAndSpacingSize * 9.5 + 'px')
      .text(d => d.name);

  const continentValueLabels = g.selectAll('.industry-continents-value-label')
    .data(data.clusters.continents)
    .enter().append('text')
      .attr('class', 'industry-continents-value-label')
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top + (textAndSpacingSize * 9.5))
      .style('font-size', textAndSpacingSize * 7.5 + 'px')
      .text('0% of employees');

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

  nodeLabels.selectAll('.industry-nodes-label');
    // .data(data.nodes)
    // .enter().append('text')
      // .attr('class', 'industry-nodes-label')
      // .attr('x', d => xScale(d.x) + margin.left)
      // .attr('y', d => yScale(d.y) + margin.top + (radius * 1.45))
      // .style('font-size', textAndSpacingSize * 1 + 'px')
      // .style('font-size', textAndSpacingSize * 0.55 + 'px')
      // .text(d => ellipsisText(d.name as string, 20));

  nodeLabels
    .style('display', 'none');

  function zoomToPoint(d: any, external?: boolean) {
    const action = external ? NodeAction.ExternalSelect : NodeAction.SelectNode;
    // @ts-ignore
    if (state.active !== null && (state.active.element.node() === this ||
        (state.active.datum && state.active.datum.id === d.id)) ) {
      onNodeSelect(undefined, action);
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
      width,
      height * 0.95,
      outerWidth,
      outerHeight,
      7,
    );

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

    svg.attr('class', svgRingModeClassName);

    onNodeSelect(state.active.datum.id, action);
  }

  const setHighlightedPoint = (id: string | undefined, action: NodeAction) => {
    if (id === undefined) {
      if (action === NodeAction.Reset) {
        reset();
      } else if (action === NodeAction.SoftReset) {
        clearActive(false, NodeAction.SoftReset);
        svg.call(zoom);
        render();
      }
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
        .attr('d', circlePath(centerX, centerY, outerRingRadius + 4));

      innerRingLabelPath
        .attr('d', circlePath(centerX, centerY, innerRingRadius + 4));

      const smallerRadius = (r: number) => {
        const newRadius = r * 0.85;
        if (newRadius < radius * 0.5) {
          return radius * 0.5;
        } else {
          return newRadius;
        }
      };
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
          edgeData.find((e: {id: string}) => e.id === d.id) ? smallerRadius(d.radius ? d.radius * 0.5 : radius * 0.5) : radius)
        .style('display', d => d.id === state.active.datum.id ||
          edgeData.find((e: {id: string}) => e.id === d.id) ? 'block' : 'none')
        .attr('fill', d => d.color)
        .attr('class', d => d.id === state.active.datum.id ? 'industry-edge-node active' : 'industry-edge-node')
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
          .style('font-size', Math.min(3.6, Math.max(radius * 0.8, 3.2)) + 'px')
          .text(d => ellipsisText(d.name as string, 24))
          .call(wrap, Math.max(radius * 14, 28), radius * 2)
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
      continentValueLabels
        .style('display', 'none');

      countryLabels
        .style('display', 'none');

      nodeLabels
        .style('display', 'none');

      state.active.element
        .style('display', 'block');

      if (state.zoomLevel !== ZoomLevel.Node) {
        state.zoomLevel = ZoomLevel.Node;
        onZoomLevelChange(ZoomLevel.Node);
      }
    } else {
      nodes
        .each((d: any) => d.adjustedCoords = undefined)
        .attr('class', 'industry-edge-node')
        .style('display', 'block')
        .style('pointer-events', state.zoom > 2.25  ? 'auto' : 'none')
        .style('opacity', () => {
          if (state.zoom < 2.5) {
            return 0.5;
          } else {
            return 0.75;
          }
        })
        .attr('fill', d => state.zoom < 3.5 ? '#fff' : d.color)
        .attr('r', d => d.radius ? d.radius : radius)
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
        .style('pointer-events', zoomScales.continent.fill(state.zoom) > 0.1 &&
          zoomScales.countries.fill(state.zoom) <= 0.01
          ? 'auto' : 'none')
        .attr('stroke', rgba('#efefef', zoomScales.continent.stroke(state.zoom)))
        .style('opacity', 1);

      countries
        .style('pointer-events', zoomScales.countries.fill(state.zoom) > 0.01 &&
          state.zoom < 3.5 ? 'auto' : 'none')
        .attr('fill', d => state.zoom < 3.5 ? d.color : rgba(d.color, 0))
        .attr('stroke', rgba('#efefef', zoomScales.countries.stroke(state.zoom)))
        .style('opacity', 1);

      continentLabels
        .style('opacity', zoomScales.continent.label(state.zoom))
        .style('display', 'block');
      continentValueLabels
        .style('opacity', zoomScales.continent.label(state.zoom))
        .style('display', 'block');

      countryLabels
        .style('opacity', zoomScales.countries.label(state.zoom))
        .style('display', 'block');

      if (state.zoom > 3.5) {
      // if (state.zoom > 8) {
        nodeLabels
          .style('opacity', 1)
          // .style('opacity', zoomScales.nodes.label(state.zoom))
          .style('display', 'block');
      } else {
        nodeLabels
          .style('display', 'none');
      }

      if (state.zoom > 3.5) {
        if (state.zoomLevel !== ZoomLevel.Node) {
          state.zoomLevel = ZoomLevel.Node;
          onZoomLevelChange(ZoomLevel.Node);
        }
      } else if (state.zoom > 1.5) {
        if (state.zoomLevel !== ZoomLevel.Cluster2) {
          state.zoomLevel = ZoomLevel.Cluster2;
          onZoomLevelChange(ZoomLevel.Cluster2);
        }
      } else {
        if (state.zoomLevel !== ZoomLevel.Cluster1) {
          state.zoomLevel = ZoomLevel.Cluster1;
          onZoomLevelChange(ZoomLevel.Cluster1);
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
          // .attr('stroke', '#efefef')
          // .attr('stroke-width', 4)
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
          .attr('r', state.hoveredNode.radius ? state.hoveredNode.radius : radius)
          .attr('stroke', state.zoom < 3.5 ? '#efefef' : '#333')
          .attr('stroke-width', radius < 2 ? 0.6 : 1)
          .style('display', 'block');
      } else {
        hoveredNode
          .style('display', 'none');
      }
    }
  }

  function update(newData: SuccessResponse, rcaThreshold: number) {
    const {c1Rca, c3Rca, clusterData, naicsRca} = newData;
    const continentsData = clusterData.filter(d => d.level === 1);
    const totalEmployees = continentsData.reduce((total, c) => c.numEmploy ? c.numEmploy + total : total, 0);

    const intensityColorScaleContinents = d3.scaleSymlog()
      .domain(d3.extent(c1Rca.map(c => c.rca ? c.rca : 0)) as [number, number])
      .range(intensityColorRange as any);

    const intensityColorScaleCountries = d3.scaleSymlog()
      .domain(d3.extent(c3Rca.map(c => c.rca ? c.rca : 0)) as [number, number])
      .range(intensityColorRange as any);

    continents.each(d => {
      const newDatum = c1Rca.find(({clusterId}) =>
        clusterId !== null && d.clusterId.toString() === clusterId.toString());
      if (newDatum && newDatum.rca !== null) {
        d.color = intensityColorScaleContinents(newDatum.rca) as unknown as string;
      } else {
        d.color = intensityColorRange[0];
      }
      const countDatum = clusterData.find(({clusterId}) =>
        clusterId !== null && d.clusterId.toString() === clusterId.toString());
      if (countDatum && countDatum.numEmploy !== null) {
        d.numEmploy = countDatum.numEmploy;
        d.shareEmploy = parseFloat((countDatum.numEmploy / totalEmployees * 100).toFixed(1));
      }
    });

    continentValueLabels
      .text(d => {
        const newDatum = clusterData.find(({clusterId}) =>
          clusterId !== null && d.clusterId.toString() === clusterId.toString());
        if (newDatum && newDatum.numEmploy !== null) {
          return parseFloat((newDatum.numEmploy / totalEmployees * 100).toFixed(1)) + '% of employees';
        } else {
          return '0% of employees';
        }

      });

    countries.each(d => {
      const newDatum = c3Rca.find(({clusterId}) =>
          clusterId !== null && d.clusterId.toString() === clusterId.toString());
      if (newDatum && newDatum.rca !== null) {
        d.color = intensityColorScaleCountries(newDatum.rca) as unknown as string;
      } else {
        d.color = intensityColorRange[0];
      }
      const countDatum = clusterData.find(({clusterId}) =>
        clusterId !== null && d.clusterId.toString() === clusterId.toString());
      if (countDatum && countDatum.numEmploy !== null) {
        d.numEmploy = countDatum.numEmploy;
        d.shareEmploy = parseFloat((countDatum.numEmploy / totalEmployees * 100).toFixed(1));
      }
    });

    nodes.each(d => {
      const newDatum = naicsRca.find(({naicsId}) => naicsId !== null && d.id.toString() === naicsId.toString());
      if (newDatum && newDatum.rca !== null) {
        d.color = newDatum.rca >= rcaThreshold ? d.industryColor : lowIntensityNodeColor;
        d.rca = newDatum.rca;
      } else {
        d.color = lowIntensityNodeColor;
        d.rca = 0;
      }
    })
    .style('--true-fill-color', d => d.color);


    render(true);
  }

  function updateNodeSize(nodeSizing: NodeSizing, newData?: SuccessResponse) {
    const field = nodeSizing === NodeSizing.cityEmployees ? 'numEmploy' : 'numCompany';
    let radiusScale: undefined | ((val: number) => number);
    if (newData && newData.naicsData) {
      if (nodeSizing === NodeSizing.rca) {
        const allValues = newData.naicsRca.map(c => c.rca ? c.rca : 0) as number[];
        radiusScale = d3.scaleSymlog()
          .domain([0, d3.max(allValues)] as [number, number])
          .range([ 1.5, 8]);
      } else {
        const allValues = newData.naicsData.map(c => c[field] ? c[field] : 0) as number[];
        radiusScale = d3.scaleLinear()
          .domain([0, d3.max(allValues)] as [number, number])
          .range([ 1.75, 12]);
      }
    }
    nodes.each(d => {
      if (nodeSizing === NodeSizing.globalCompanies) {
        d.radius = data.global.companySizeByScale(d.globalSumNumCompany) * radiusAdjuster;
      } else if (nodeSizing === NodeSizing.globalEmployees) {
        d.radius = data.global.employSizeByScale(d.globalSumNumEmploy) * radiusAdjuster;
      } else if (radiusScale && newData && newData.naicsRca && nodeSizing === NodeSizing.rca) {
        const targetNode = newData.naicsRca.find(dd => dd.naicsId !== null && dd.naicsId.toString() === d.id);
        d.radius = targetNode && targetNode.rca
          ? radiusScale(targetNode.rca as number) : radiusScale(0);
      } else if (radiusScale && newData && newData.naicsData) {
        const targetNode = newData.naicsData.find(dd => dd.naicsId === d.id);
        d.radius = targetNode && targetNode[field]
          ? radiusScale(targetNode[field] as number) : radiusScale(0);
      } else {
        d.radius = radius;
      }
    });
    render(true);
  }

  function updateNodeColor(colorBy: ColorBy) {
    nodes.each(d => {
      if (colorBy === ColorBy.education) {
        d.color = d.educationColor;
      } else if (colorBy === ColorBy.wage) {
        d.color = d.wageColor;
      } else {
        d.color = d.industryColor;
      }
    })
    .style('--true-fill-color', d => d.color);

    render(true);
  }

  return {
    render, reset, zoomIn, zoomOut, setHighlightedPoint, setExternalHoveredId, update,
    updateNodeSize, updateNodeColor,
  };

};

export default createChart;
