import React, {useRef, useEffect, useState} from 'react';
import {useGlobalIndustryMap} from '../../../../hooks/useGlobalIndustriesData';
import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
} from '../../../../types/graphQL/graphQLTypes';
import {usePrevious} from 'react-use';
import TreeMap, {transformData, Inputs} from 'react-canvas-treemap';
import {sectorColorMap} from '../../../../styling/styleUtils';
import {useWindowWidth} from '../../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import noop from 'lodash/noop';

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

interface Props {
  cityId: number;
  year: number;
  digitLevel: DigitLevel;
}

const CompositionTreeMap = (props: Props) => {
  const {cityId, year, digitLevel} = props;
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
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
    output = <h2>loading</h2>;
  } else if (error !== undefined) {
    output = <h2>{error.message}</h2>;
    console.error(error);
  }  else if (industryMap.error !== undefined) {
    output = <h2>{industryMap.error.message}</h2>;
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {industries} = dataToUse;
    const treeMapData: Inputs['data'] = [];
    industries.forEach(({naicsId, numCompany}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, topLevelParentId} = industry;
        treeMapData.push({
          id: naicsId,
          value: numCompany ? numCompany : 0,
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
    output = (
      <TreeMapContainer>
        <TreeMap
          highlighted={undefined}
          cells={transformed.treeMapCells}
          numCellsTier={0}
          chartContainerWidth={dimensions.width}
          chartContainerHeight={dimensions.height}
          onCellClick={noop}
          onMouseOverCell={noop}
          onMouseLeaveChart={noop}
        />
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
