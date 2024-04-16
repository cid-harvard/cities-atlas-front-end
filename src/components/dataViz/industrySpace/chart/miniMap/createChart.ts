import * as d3 from "d3";
import { getAspectRatio } from "../Utils";
import { rgba } from "polished";
import { SuccessResponse } from "../useRCAData";
import { LayoutData } from "../useLayoutData";
import { intensityColorRange } from "../../../../../styling/styleUtils";

interface Input {
  rootEl: HTMLDivElement;
  data: LayoutData;
  rootWidth: number;
  rootHeight: number;
}

const createChart = (input: Input) => {
  const { rootEl, data, rootWidth, rootHeight } = input;

  const { width, height, outerWidth, outerHeight, margin } = getAspectRatio(
    { w: 4, h: 3 },
    { w: rootWidth, h: rootHeight },
    -5,
  );

  const svg = d3
    .select(rootEl)
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

  const xScale = d3
    .scaleLinear() // interpolator for X axis -- inner plot region
    .domain(d3.extent(data.nodes, ({ x }) => x) as [number, number])
    .range([0, width]);

  const yScale = d3
    .scaleLinear() // interpolator for Y axis -- inner plot region
    .domain(d3.extent(data.nodes, ({ y }) => y) as [number, number])
    .range([height, 0]);

  const g = svg.append("g");

  const continents = g
    .selectAll(".industry-continents")
    .data(data.clusters.continents)
    .enter()
    .append("polygon")
    .attr("class", "industry-continents")
    .attr("points", (d) =>
      d.polygon
        .map(([xCoord, yCoord]: [number, number]) =>
          [
            (xScale(xCoord) as number) + margin.left,
            (yScale(yCoord) as number) + margin.top,
          ].join(","),
        )
        .join(" "),
    )
    .attr("fill", (d) => d.color)
    .attr("stroke", rgba("#efefef", 1))
    .attr("stroke-width", 1.5);

  g.selectAll(".industry-countries")
    .data(data.clusters.countries)
    .enter()
    .append("polygon")
    .attr("class", "industry-countries")
    .attr("points", (d) =>
      d.polygon
        .map(([xCoord, yCoord]) =>
          [
            (xScale(xCoord) as number) + margin.left,
            (yScale(yCoord) as number) + margin.top,
          ].join(","),
        )
        .join(" "),
    )
    .attr("fill", "none")
    .attr("stroke", rgba("#efefef", 0.5))
    .attr("stroke-width", 0.75);

  const node = g
    .append("circle")
    .attr("class", "industry-node")
    .attr("r", 5)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.75);

  function render(nodeId: string | undefined) {
    const targetNode = data.nodes.find((n) => n.id === nodeId);
    if (targetNode) {
      node
        .style("display", "block")
        .attr("fill", targetNode.industryColor)
        .attr("cx", (xScale(targetNode.x) as number) + margin.left)
        .attr("cy", (yScale(targetNode.y) as number) + margin.top);
    }
  }

  function update(nodeId: string | undefined, newData: SuccessResponse) {
    const intensityColorScaleContinents = d3
      .scaleSymlog()
      .domain(
        d3.extent(newData.c1Rca.map((c) => (c.rca ? c.rca : 0))) as [
          number,
          number,
        ],
      )
      .range(intensityColorRange as any);

    continents
      .each((d) => {
        const newDatum = newData.c1Rca.find(
          ({ clusterId }) =>
            clusterId !== null &&
            d.clusterId.toString() === clusterId.toString(),
        );
        if (newDatum && newDatum.rca !== null) {
          d.color = intensityColorScaleContinents(
            newDatum.rca,
          ) as unknown as string;
        } else {
          d.color = intensityColorRange[0];
        }
      })
      .attr("fill", (d) => d.color);

    render(nodeId);
  }

  return { render, update };
};

export default createChart;
