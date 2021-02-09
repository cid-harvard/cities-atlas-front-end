import {scaleQuantize} from 'd3-scale';
import {extent} from 'd3-array';

export const colorByCountryColorMap = [
  {id: "United States", color: "#696969"},
  {id: "Canada", color: "#1E90FF"},
  {id: "Peru", color: "#B22222"},
  {id: "Brazil", color: "#D2691E"},
  {id: "Chile", color: "#228B22"},
  {id: "Argentina", color: "#FF00FF"},
  {id: "Spain", color: "#DCDCDC"},
  {id: "Morocco", color: "#32CD32"},
  {id: "Portugal", color: "#FFD700"},
  {id: "United Kingdom", color: "#DAA520"},
  {id: "France", color: "#808080"},
  {id: "Belgium", color: "#808080"},
  {id: "Germany", color: "#008000"},
  {id: "Italy", color: "#ADFF2F"},
  {id: "Norway", color: "#F0FFF0"},
  {id: "Sweden", color: "#FF69B4"},
  {id: "Denmark", color: "#CD5C5C"},
  {id: "Czech Republic", color: "#4B0082"},
  {id: "Slovenia", color: "#FFFFF0"},
  {id: "Poland", color: "#F0E68C"},
  {id: "Austria", color: "#E6E6FA"},
  {id: "Croatia", color: "#FFF0F5"},
  {id: "Russia", color: "#7CFC00"},
  {id: "Hungary", color: "#FFFACD"},
  {id: "Finland", color: "#ADD8E6"},
  {id: "Estonia", color: "#F08080"},
  {id: "Latvia", color: "#E0FFFF"},
  {id: "Lithuania", color: "#FAFAD2"},
  {id: "Greece", color: "#D3D3D3"},
  {id: "Romania", color: "#D3D3D3"},
  {id: "Israel", color: "#90EE90"},
  {id: "India", color: "#FFB6C1"},
  {id: "China", color: "#FFA07A"},
  {id: "Thailand", color: "#20B2AA"},
  {id: "Singapore", color: "#87CEFA"},
  {id: "Taiwan", color: "#778899"},
  {id: "Japan", color: "#778899"},
  {id: "Philippines", color: "#B0C4DE"},
]

const proximityColors = [
   '#F9E200',
   '#E3260B',
   '#C9178E',
   '#6E1DB2',
   '#223E9A',
];

export const createProximityScale = (values: number[]) => {
  const scale: (val: number) => string = scaleQuantize()
    .domain(extent(values) as [number, number])
    .range(proximityColors as any[]) as any;
  return scale;
}