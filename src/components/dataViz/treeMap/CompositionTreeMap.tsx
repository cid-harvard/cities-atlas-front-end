import React, {useRef, useEffect, useState} from 'react';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
  ClassificationNaicsIndustry,
  CompositionType,
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
import ErrorBoundary from '../ErrorBoundary';
import useFluent from '../../../hooks/useFluent';
import {numberWithCommas} from '../../../Utils';
import {breakPoints} from '../../../styling/GlobalGrid';
import PreChartRow, {Indicator} from '../../../components/general/PreChartRow';
import SimpleTextLoading from '../../../components/transitionStateComponents/SimpleTextLoading';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
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

export const useEconomicCompositionQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(ECONOMIC_COMPOSITION_QUERY, { variables });

interface Props {
  cityId: number;
  year: number;
  highlighted: string | undefined;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  openHowToReadModal?: () => void;
  setHighlighted: (value: string | undefined) => void;
}

const CompositionTreeMap = (props: Props) => {
  const {
    cityId, year, digitLevel, compositionType, highlighted, hiddenSectors,
    openHowToReadModal, setHighlighted,
  } = props;
  const industryMap = useGlobalIndustryMap();
  const getString = useFluent();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useEconomicCompositionQuery({cityId, year});

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
      }, 0);
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

  const indicator: Indicator = {
    text: undefined,
    tooltipContent: undefined,
  };
  let output: React.ReactElement<any> | null;
  if (industryMap.loading || !dimensions || (loading && prevData === undefined)) {
    indicator.text = (
      <>
        {getString('global-ui-total') + ': '}<SimpleTextLoading />
      </>
    );
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  }  else if (industryMap.error !== undefined) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {industries} = dataToUse;
    const treeMapData: Inputs['data'] = [];
    let total = 0;
    industries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, topLevelParentId} = industry;
        if (!hiddenSectors.includes(topLevelParentId)) {
          const companies = numCompany ? numCompany : 0;
          const employees = numEmploy ? numEmploy : 0;
          total = compositionType === CompositionType.Companies ? total + companies : total + employees;
          treeMapData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topLevelParentId,
          });
        }
      }
    });
    if (!treeMapData.length) {
      indicator.text = getString('global-ui-total') + ': ―';
      output = (
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-no-sectors-selected'} />
        </LoadingOverlay>
      );
    } else {
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
          const numCompany = industryWithData.numCompany ? industryWithData.numCompany : 0;
          const numEmploy = industryWithData.numEmploy ? industryWithData.numEmploy : 0;
          const value = compositionType === CompositionType.Companies ? numCompany : numEmploy;
          const share = (value / total * 100).toFixed(2) + '%';
          node.innerHTML = getStandardTooltip({
            title: industry.name ? industry.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows: [
              [getString('tooltip-number-generic', {value: compositionType}) + ':', numberWithCommas(value)],
              [getString('tooltip-share-generic', {value: compositionType}) + ':', share],
              [getString('global-ui-naics-code') + ':', industry.naicsId],
              [getString('global-ui-year') + ':', year.toString()],
            ],
            boldColumns: [1, 2],
          });
        }
      };

      indicator.text = loading ? (
        <>
          {getString('global-ui-total') + ': '}<SimpleTextLoading />
        </>
      ) : `${getString('global-ui-total')}: ${numberWithCommas(total)} ${compositionType.toLowerCase()}`;
      indicator.tooltipContent = getString('glossary-total-shown');
      output = (
        <TreeMapContainer>
          <Tooltip
            explanation={<TooltipContent ref={tooltipContentRef} />}
            cursor={'default'}
            overrideStyles={true}
          >
            <ErrorBoundary>
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
            </ErrorBoundary>
          </Tooltip>
          {loadingOverlay}
        </TreeMapContainer>
      );
    }
  } else {
    output = null;
  }

  return (
    <>
      <PreChartRow
        onReadThisChart={openHowToReadModal}
        indicator={indicator}
        searchInGraphOptions={{hiddenSectors, digitLevel, setHighlighted}}
        settingsOptions={{compositionType: true, digitLevel: true}}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default React.memo(CompositionTreeMap);
