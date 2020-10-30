import React, {useEffect} from 'react';
import {
  useEconomicCompositionQuery,
} from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import LoadingBlock from '../../../../../components/transitionStateComponents/VizLoadingBlock';
import {transformData, Inputs} from 'react-canvas-treemap';
import {
  useGlobalIndustryMap,
} from '../../../../../hooks/useGlobalIndustriesData';
import {DigitLevel, CompositionType} from '../../../../../types/graphQL/graphQLTypes';
import {sectorColorMap, FullPageOverlay} from '../../../../../styling/styleUtils';
import html2canvas from 'html2canvas';

interface Props {
  cityId: number;
  cityName: string | undefined;
  year: number;
  onClose: () => void;
  compositionType: CompositionType;
  hiddenSectors: string[];
  digitLevel: DigitLevel;
  treeMapCellsNode: HTMLDivElement;
}

export default (props: Props) => {
  const {
    cityId, year, onClose, compositionType, hiddenSectors, digitLevel, treeMapCellsNode,
    cityName,
  } = props;

  const {error, data} = useEconomicCompositionQuery({cityId, year});
  const industryMap = useGlobalIndustryMap();

  useEffect(() => {
    if (data !== undefined && !industryMap.loading && !industryMap.error) {
      const boundingRect = treeMapCellsNode.getBoundingClientRect();
      const width = boundingRect.width * 2;
      const height = boundingRect.height * 2;
      const {industries} = data;
      const treeMapData: Inputs['data'] = [];
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
      const transformed = transformData({
        data: treeMapData,
        width,
        height,
        colorMap: sectorColorMap,
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
    data, industryMap, onClose, compositionType, digitLevel, hiddenSectors, treeMapCellsNode, cityName,
    year,
  ]);

  if (error) {
    console.error(error);
    onClose();
  }

  return (
    <FullPageOverlay>
      <LoadingBlock />
    </FullPageOverlay>
  );
};
