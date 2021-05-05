import {useEffect, useState} from 'react';
import {
  useGlobalIndustryMap,
} from '../../../../hooks/useGlobalIndustriesData';
import {
  useGlobalClusterMap,
} from '../../../../hooks/useGlobalClusterData';
import LAYOUT_DATA from './data/layout_data.json';
import {
  ClassificationNaicsIndustry,
} from '../../../../types/graphQL/graphQLTypes';
import {
  sectorColorMap,
  wageColorRange,
  educationColorRange,
} from '../../../../styling/styleUtils';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {
  DigitLevel,
} from '../../../../types/graphQL/graphQLTypes';
import {defaultYear} from '../../../../Utils';
import {scaleLinear} from 'd3-scale';

interface ContinentCluster {
  center: number[];
  color: string;
  clusterCode: number;
  clusterId: string;
  name: string;
  polygon: number[][];
  numEmploy?: number;
  shareEmploy?: number;
}

interface CountryCluster extends ContinentCluster {
  continent: string;
}

interface Clusters {
  continents: ContinentCluster[];
  countries: CountryCluster[];
}

interface Edge {
  trg: ClassificationNaicsIndustry['id'];
  proximity: number;
}

interface Node {
  id: ClassificationNaicsIndustry['id'];
  name: ClassificationNaicsIndustry['name'];
  code: ClassificationNaicsIndustry['code'];
  industryColor: string;
  color: string;
  sectorName: string;
  continent: string;
  country: string;
  edges: Edge[];
  x: number;
  y: number;
  rca?: number;
  radius?: number;
  globalSumNumCompany: number;
  globalSumNumEmploy: number;
  yearsEducation: number;
  hourlyWage: number;
  educationColor: string;
  wageColor: string;
}

export interface LayoutData {
  clusters: Clusters;
  nodes: Node[];
  global: {
    companySizeByScale: (value: number) => number,
    employSizeByScale: (value: number) => number,
  };
}

interface Output {
  loading: boolean;
  error: any;
  data: LayoutData | undefined;
}

export const lowIntensityNodeColor = '#dddddd';

const useLayoutData = ():Output => {
  const [output, setOutput] = useState<Output>({
    loading: true,
    error: undefined,
    data: undefined,
  });

  const {loading, error, data: industryData} = useGlobalIndustryMap();
  const {loading: clusterLoading, error: clusterError, data: clusterData} = useGlobalClusterMap();

  const {
    loading: loadingIndustryMapData,
    data: industryMapData,
  } = useAggregateIndustryMap({level: DigitLevel.Six, year: defaultYear});

  useEffect(() => {
    if (!output.data) {
      if (error) {
        setOutput({loading: false, error, data: undefined});
      } else if (clusterError) {
        setOutput({loading: false, error: clusterError, data: undefined});
      } else if (industryData && !loading && industryMapData && !loadingIndustryMapData &&
        !clusterLoading && clusterData)
      {
        const {globalMinMax, industries} = industryMapData;
        const minCompanySizeBy = globalMinMax && globalMinMax.minSumNumCompany ? globalMinMax.minSumNumCompany : 0.001;
        const maxCompanySizeBy = globalMinMax && globalMinMax.maxSumNumCompany ? globalMinMax.maxSumNumCompany : 1;
        const companySizeByScale = scaleLinear()
          .domain([minCompanySizeBy, maxCompanySizeBy])
          .range([ 3, 15]);

        const minEmploySizeBy = globalMinMax && globalMinMax.minSumNumEmploy ? globalMinMax.minSumNumEmploy : 0.001;
        const maxEmploySizeBy = globalMinMax && globalMinMax.maxSumNumEmploy ? globalMinMax.maxSumNumEmploy : 1;
        const employSizeByScale = scaleLinear()
          .domain([minEmploySizeBy, maxEmploySizeBy])
          .range([ 3, 15]);

        const educationColorScale = scaleLinear()
          .domain([globalMinMax.minYearsEducation,globalMinMax.maxYearsEducation])
          .range(educationColorRange as any) as any;
        const wageColorScale = scaleLinear()
          .domain([globalMinMax.minHourlyWage,globalMinMax.maxHourlyWage])
          .range(wageColorRange as any) as any;

        const data: Output['data'] = {
          clusters: {
            continents: LAYOUT_DATA.clusters.continents.map(c => {
              const cluster = clusterData[c.clusterId.toString()];
              const name = cluster && cluster.name ? cluster.name : '---';
              return {...c, name };
            }),
            countries: LAYOUT_DATA.clusters.countries.map(c => {
              const cluster = clusterData[c.clusterId.toString()];
              const name = cluster && cluster.name ? cluster.name : '---';
              return {...c, name };
            }),
          },
          nodes: LAYOUT_DATA.nodes.map(n => {
            const industry = industryData[n.id.toString()];
            const parent = industryData[industry.naicsIdTopParent.toString()];
            const parentIndustry = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
            const globalIndustry = industries[industry.naicsId];
            const yearsEducation = globalIndustry ? globalIndustry.yearsEducation : 0;
            const hourlyWage = globalIndustry ? globalIndustry.hourlyWage : 0;
            return {
              ...n,
              id: industry.naicsId,
              name: industry.name,
              code: industry.code,
              industryColor: parentIndustry ? parentIndustry.color : lowIntensityNodeColor,
              color: parentIndustry ? parentIndustry.color : lowIntensityNodeColor,
              sectorName: parent && parent.name ? parent.name : '',
              edges: n.edges.map(e => ({trg: e.trg.toString(), proximity: e.proximity})),
              globalSumNumCompany: globalIndustry ? globalIndustry.sumNumCompany : 0,
              globalSumNumEmploy: globalIndustry ? globalIndustry.sumNumEmploy : 0,
              yearsEducation,
              hourlyWage,
              educationColor: educationColorScale(yearsEducation),
              wageColor: wageColorScale(hourlyWage),
            };
          }),
          global: {
            companySizeByScale, employSizeByScale,
          },
        };
        setOutput({loading: false, error: undefined, data});
      }
    }
  }, [
    output, loading, error, industryData, industryMapData, loadingIndustryMapData,
    clusterLoading, clusterError,clusterData,
  ]);

  return output;
};

export default useLayoutData;

