import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import {
  useEconomicCompositionQuery,
  CompositionType,
} from '../../../../components/dataViz/treeMap/CompositionTreeMap';
import LoadingBlock from '../../../../components/transitionStateComponents/VizLoadingBlock';
import {transformData, Inputs} from 'react-canvas-treemap';
import {
  useGlobalIndustryMap,
} from '../../../../hooks/useGlobalIndustriesData';
import {DigitLevel} from '../../../../types/graphQL/graphQLTypes';
import {sectorColorMap} from '../../../../styling/styleUtils';
import html2canvas from 'html2canvas';

const Root = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

interface Props {
  cityId: number;
  year: number;
  onClose: () => void;
  compositionType: CompositionType;
  hiddenSectors: string[];
  digitLevel: DigitLevel;
  treeMapCellsNode: HTMLDivElement;
}

export default (props: Props) => {
  const {cityId, year, onClose, compositionType, hiddenSectors, digitLevel, treeMapCellsNode} = props;

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
          const {name, topLevelParentId} = industry;
          if (!hiddenSectors.includes(topLevelParentId)) {
            const companies = numCompany ? numCompany : 0;
            const employees = numEmploy ? numEmploy : 0;
            treeMapData.push({
              id: naicsId,
              value: compositionType === CompositionType.Companies ? companies : employees,
              title: name ? name : '',
              topLevelParentId,
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
            link.download = 'chart.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            link.remove();
            onClose();
          })
          .catch(onClose);
      } else {
        onClose();
      }
    }
  }, [data, industryMap, onClose, compositionType, digitLevel, hiddenSectors, treeMapCellsNode]);

  if (error) {
    onClose();
  }

  return (
    <Root>
      <LoadingBlock />
    </Root>
  );
};
