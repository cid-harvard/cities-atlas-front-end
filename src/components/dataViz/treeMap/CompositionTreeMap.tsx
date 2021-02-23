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
import {sectorColorMap} from '../../../styling/styleUtils';
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
import PreChartRow, {Indicator, VizNavItem, VizNavStyle} from '../../../components/general/PreChartRow';
import SimpleTextLoading from '../../../components/transitionStateComponents/SimpleTextLoading';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';
import {ColorBy} from '../../../routing/routes';
import useColorByIntensity from './useColorByIntensity';

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
  colorBy: ColorBy;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  setHighlighted: (value: string | undefined) => void;
  vizNavigation: VizNavItem[];
}

const CompositionTreeMap = (props: Props) => {
  const {
    cityId, year, digitLevel, compositionType, highlighted, hiddenSectors,
    setHighlighted, colorBy, vizNavigation,
  } = props;
  const industryMap = useGlobalIndustryMap();
  const getString = useFluent();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useEconomicCompositionQuery({cityId, year});
  const intensity = useColorByIntensity({digitLevel, colorBy, compositionType});

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
  if (industryMap.loading || !dimensions || (loading && prevData === undefined) ||
      (colorBy === ColorBy.intensity && intensity.loading)
    ) {
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
  } else if (industryMap.error !== undefined) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(industryMap.error);
  } else if (intensity.error !== undefined && colorBy === ColorBy.intensity) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(intensity.error);
  } else if (dataToUse !== undefined) {
    const {industries} = dataToUse;
    const treeMapData: Inputs['data'] = [];
    let total = 0;
    industries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, naicsIdTopParent} = industry;
        if (!hiddenSectors.includes(naicsIdTopParent.toString())) {
          const companies = numCompany ? numCompany : 0;
          const employees = numEmploy ? numEmploy : 0;
          total = compositionType === CompositionType.Companies ? total + companies : total + employees;
          let fill: string | undefined;
          if (intensity && intensity.industries) {
            const industryIntesity = intensity.industries.find(d => d.naicsId === naicsId);
            if (industryIntesity) {
              fill = industryIntesity.fill;
            }
          }
          treeMapData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topLevelParentId: naicsIdTopParent.toString(),
            fill,
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
          const color = sectorColorMap.find(c => c.id === industry.naicsIdTopParent.toString());
          const numCompany = industryWithData.numCompany ? industryWithData.numCompany : 0;
          const numEmploy = industryWithData.numEmploy ? industryWithData.numEmploy : 0;
          const value = compositionType === CompositionType.Employees ? numEmploy : numCompany;
          const share = (value / total * 100);
          const shareString = share < 0.01 ? '<0.01%' : share.toFixed(2) + '%';
          const rows = [
            [getString('tooltip-number-generic', {value: compositionType}) + ':', numberWithCommas(value)],
            [getString('tooltip-share-generic', {value: compositionType}) + ':', shareString],
            [getString('global-ui-naics-code') + ':', industry.naicsId],
            [getString('global-ui-year') + ':', year.toString()],
          ];
          if (intensity && intensity.industries) {
            const industryIntesity = intensity.industries.find(d => d.naicsId === id);
            if (industryIntesity) {

              const rcaNumCompany = industryIntesity.rcaNumCompany ? industryIntesity.rcaNumCompany : 0;
              const rcaNumEmploy = industryIntesity.rcaNumEmploy ? industryIntesity.rcaNumEmploy : 0;
              const rca = compositionType === CompositionType.Employees ? rcaNumEmploy : rcaNumCompany;
              rows.push([getString('tooltip-intensity-generic', {value: compositionType}) + ':', rca.toFixed(3)]);
            }
          }
          node.innerHTML = getStandardTooltip({
            title: industry.name ? industry.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows,
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
            explanation={<div ref={tooltipContentRef} />}
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
        indicator={indicator}
        searchInGraphOptions={{hiddenSectors, digitLevel, setHighlighted}}
        settingsOptions={{compositionType: true, digitLevel: true, colorBy: true}}
        vizNavigation={vizNavigation}
        vizNavigationStyle={VizNavStyle.Underline}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default React.memo(CompositionTreeMap);
