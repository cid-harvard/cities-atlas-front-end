import React, {useRef, useEffect, useState} from 'react';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {usePrevious} from 'react-use';
import TreeMap, {transformData, Inputs} from 'react-canvas-treemap';
import {sectorColorMap, secondaryFont} from '../../../styling/styleUtils';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import noop from 'lodash/noop';
import SimpleError from '../../../components/transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import Tooltip from '../../general/Tooltip';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
`;

const TreeMapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

const TooltipContent = styled.div`
  font-family: ${secondaryFont};
`;

const ECONOMIC_COMPOSITION_QUERY = gql`
  query GetCityIndustryTreeData($cityId: Int!, $year: Int!) {
    industries: cityIndustryYearList(cityId: $cityId, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
  }
`;

interface SuccessResponse {
  industries: {
    id: CityIndustryYear['id'],
    naicsId: CityIndustryYear['naicsId'],
    numCompany: CityIndustryYear['numCompany'],
    numEmploy: CityIndustryYear['numEmploy'],
  }[];
}

interface Variables {
  cityId: number;
  year: number;
}

export enum CompositionType {
  Companies = 'Companies',
  Employees = 'Employees',
}

interface Props {
  cityId: number;
  year: number;
  highlighted: string | undefined;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
}

const CompositionTreeMap = (props: Props) => {
  const {cityId, year, digitLevel, compositionType, highlighted} = props;
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useQuery<SuccessResponse, Variables>(ECONOMIC_COMPOSITION_QUERY, {
    variables: { cityId, year },
  });

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);


  const prevData = usePrevious(data);
  let dataToUse: SuccessResponse | undefined;
  if (data) {
    dataToUse = data;
  } else if (prevData) {
    dataToUse = prevData;
  } else {
    dataToUse = undefined;
  }

  let output: React.ReactElement<any> | null;
  if (industryMap.loading || !dimensions || (loading && prevData === undefined)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  }  else if (industryMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {industries} = dataToUse;
    const treeMapData: Inputs['data'] = [];
    industries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, topLevelParentId} = industry;
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        treeMapData.push({
          id: naicsId,
          value: compositionType === CompositionType.Companies ? companies : employees,
          title: name ? name : '',
          topLevelParentId,
        });
      }
    });
    const transformed = transformData({
      data: treeMapData,
      width: dimensions.width,
      height: dimensions.height,
      colorMap: sectorColorMap,
    });
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    const onHover = (id: string) => {
      const node = tooltipContentRef.current;
      const industry = industryMap.data[id];
      const industryWithData = industries.find(({naicsId}) => naicsId === id);
      if (industry && industryWithData && node) {
        const color = sectorColorMap.find(c => c.id === industry.topLevelParentId);
        node.innerHTML = `
          <div style="border-left: solid 3px ${color ? color.color : '#fff'}; padding-left: 0.5rem;">
            <div style="width: 150px;">
              <strong>${industry.name}</strong>
            </div>
            <div
              style="display: flex; justify-content: space-between;"
            >
              <small>Number of Companies:</small>
              <small>${industryWithData.numCompany}</small>
            </div>
            <div
              style="display: flex; justify-content: space-between;"
            >
              <small>Number of Employees:</small>
              <small>${industryWithData.numEmploy}</small>
            </div>
          </div>
        `;
      }
    };

    output = (
      <TreeMapContainer>
        <Tooltip
          explanation={<TooltipContent ref={tooltipContentRef} />}
          cursor={'default'}
        >
          <TreeMap
            highlighted={highlighted}
            cells={transformed.treeMapCells}
            numCellsTier={0}
            chartContainerWidth={dimensions.width}
            chartContainerHeight={dimensions.height}
            onCellClick={noop}
            onMouseOverCell={onHover}
            onMouseLeaveChart={noop}
          />
        </Tooltip>
        {loadingOverlay}
      </TreeMapContainer>
    );
  } else {
    output = null;
  }

  return (
    <Root ref={rootRef}>{output}</Root>
  );
};

export default React.memo(CompositionTreeMap);
