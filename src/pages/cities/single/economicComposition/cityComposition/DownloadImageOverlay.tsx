import React, {useEffect} from 'react';
import {
  useEconomicCompositionQuery,
} from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import {
  useClusterCompositionQuery,
} from '../../../../../components/dataViz/treeMap/ClusterCompositionTreeMap';
import LoadingBlock from '../../../../../components/transitionStateComponents/VizLoadingBlock';
import {transformData, Inputs} from 'react-canvas-treemap';
import {
  useGlobalIndustryMap,
} from '../../../../../hooks/useGlobalIndustriesData';
import {
  useGlobalClusterMap,
} from '../../../../../hooks/useGlobalClusterData';
import {
  DigitLevel,
  CompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import {
  sectorColorMap,
  clusterColorMap,
  FullPageOverlay,
} from '../../../../../styling/styleUtils';
import html2canvas from 'html2canvas';
import {
  AggregationMode,
  ColorBy,
  ClusterLevel,
} from '../../../../../routing/routes';

interface Props {
  cityId: number;
  cityName: string | undefined;
  year: number;
  onClose: () => void;
  compositionType: CompositionType;
  aggregationMode: AggregationMode;
  hiddenSectors: string[];
  hiddenClusters: string[];
  digitLevel: DigitLevel;
  clusterLevel: ClusterLevel;
  colorBy: ColorBy;
  treeMapCellsNode: HTMLDivElement;
}

export default (props: Props) => {
  const {
    cityId, year, onClose, compositionType, hiddenSectors, digitLevel, treeMapCellsNode,
    cityName, hiddenClusters, aggregationMode, clusterLevel,
  } = props;

  const industryResponse = useEconomicCompositionQuery({cityId, year});
  const clusterResponse = useClusterCompositionQuery({cityId, year});
  const industryMap = useGlobalIndustryMap();
  const clusterMap = useGlobalClusterMap();

  useEffect(() => {
    if (industryResponse.data !== undefined && !industryMap.loading && !industryMap.error &&
        clusterResponse.data !== undefined && !clusterMap.loading && !clusterMap.error
      ) {
      const boundingRect = treeMapCellsNode.getBoundingClientRect();
      const width = boundingRect.width * 2;
      const height = boundingRect.height * 2;
      const treeMapData: Inputs['data'] = [];
      let colorMap: {id: string, color: string}[];
      if (aggregationMode === AggregationMode.cluster) {
        const {clusters} = clusterResponse.data;
        colorMap = clusterColorMap;
        clusters.forEach(({clusterId, numCompany, numEmploy}) => {
          const cluster = clusterMap.data[clusterId];
          if (cluster && cluster.level !== null && cluster.level.toString() === clusterLevel) {
            const {name, clusterIdTopParent} = cluster;
            if (!hiddenClusters.includes((clusterIdTopParent as number).toString())) {
              const companies = numCompany ? numCompany : 0;
              const employees = numEmploy ? numEmploy : 0;
              treeMapData.push({
                id: clusterId,
                value: compositionType === CompositionType.Companies ? companies : employees,
                title: name ? name : '',
                topLevelParentId: (clusterIdTopParent as number).toString(),
              });
            }
          }
        });
      } else {
        const {industries} = industryResponse.data;
        colorMap = sectorColorMap;
        industries.forEach(({naicsId, numCompany, numEmploy}) => {
          const industry = industryMap.data[naicsId];
          if (industry && industry.level === digitLevel) {
            const {name, naicsIdTopParent} = industry;
            if (!hiddenSectors.includes(naicsIdTopParent.toString())) {
              const companies = numCompany ? numCompany : 0;
              const employees = numEmploy ? numEmploy : 0;
              treeMapData.push({
                id: naicsId,
                value: compositionType === CompositionType.Companies ? companies : employees,
                title: name ? name : '',
                topLevelParentId: naicsIdTopParent.toString(),
              });
            }
          }
        });
      }
      const transformed = transformData({
        data: treeMapData,
        width,
        height,
        colorMap,
      });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        transformed.treeMapCells.forEach(cell => {
          context.beginPath();
          context.rect(cell.x0, cell.y0, cell.x1, cell.y1);
          context.fillStyle = cell.color;
          context.fill();
          context.strokeStyle = '#fff';
          context.stroke();
        });
        html2canvas(treeMapCellsNode, {allowTaint: true, backgroundColor: 'rgba(0,0,0,0)'})
          .then(cellLabels => {
            context.drawImage(cellLabels, 0, 0, width, height);
            const link = document.createElement('a');
            link.download = cityName
              ? `${cityName} - Economic Composition of Number of ${compositionType} in ${year}.png`
              : 'treemap-visualization.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            link.remove();
            onClose();
          })
          .catch(e => {
            console.error(e);
            onClose();
          });
      } else {
        console.error('Failed to get context for ' + canvas);
        onClose();
      }
    }
  }, [
    aggregationMode,
    industryResponse,
    clusterResponse,
    industryMap,
    clusterMap,
    onClose,
    compositionType,
    digitLevel,
    clusterLevel,
    hiddenSectors,
    hiddenClusters,
    treeMapCellsNode,
    cityName,
    year,
  ]);

  if (industryResponse.error) {
    console.error(industryResponse.error);
    onClose();
  }

  if (clusterResponse.error) {
    console.error(clusterResponse.error);
    onClose();
  }

  return (
    <FullPageOverlay>
      <LoadingBlock />
    </FullPageOverlay>
  );
};
