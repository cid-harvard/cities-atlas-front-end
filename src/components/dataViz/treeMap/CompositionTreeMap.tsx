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
import {sectorColorMap, educationColorRange, wageColorRange} from '../../../styling/styleUtils';
import {useWindowWidth} from '../../../contextProviders/appContext';
import styled from 'styled-components/macro';
import noop from 'lodash/noop';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import Tooltip from '../../general/Tooltip';
import ErrorBoundary from '../ErrorBoundary';
import useFluent from '../../../hooks/useFluent';
import {numberWithCommas} from '../../../Utils';
import {breakPoints} from '../../../styling/GlobalGrid';
import {Indicator} from '../../general/PreChartRow';
import SimpleTextLoading from '../../transitionStateComponents/SimpleTextLoading';
import {RapidTooltipRoot, getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';
import {ColorBy} from '../../../routing/routes';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';
import {defaultYear, formatNumber} from '../../../Utils';
import {scaleLinear} from 'd3-scale';
import QuickError from '../../transitionStateComponents/QuickError';

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
  clearHighlighted: () => void;
  digitLevel: DigitLevel;
  colorBy: ColorBy;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  setIndicatorContent: (indicator: Indicator) => void;
}

const CompositionTreeMap = (props: Props) => {
  const {
    cityId, year, digitLevel, compositionType, highlighted, hiddenSectors,
    colorBy, setIndicatorContent,
  } = props;
  const industryMap = useGlobalIndustryMap();
  const getString = useFluent();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const highlightedTooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useEconomicCompositionQuery({cityId, year});
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: digitLevel, year: defaultYear});

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
      ((colorBy === ColorBy.education || colorBy === ColorBy.wage) && aggregateIndustryDataMap.loading)
    ) {
    indicator.text = (
      <>
        {getString('global-ui-estimated-total-employees') + ': '}<SimpleTextLoading />
      </>
    );
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    indicator.text = getString('global-ui-estimated-total-employees') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (industryMap.error !== undefined) {
    indicator.text = getString('global-ui-estimated-total-employees') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(industryMap.error);
  } else if (aggregateIndustryDataMap.error !== undefined &&
    (colorBy === ColorBy.education || colorBy === ColorBy.wage)) {
    indicator.text = getString('global-ui-estimated-total-employees') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(aggregateIndustryDataMap.error);
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
          const value = compositionType === CompositionType.Companies ? companies : employees;
          treeMapData.push({
            id: naicsId,
            value,
            title: name ? name : '',
            topLevelParentId: naicsIdTopParent.toString(),
          });
        }
      }
    });
    let colorScale: (val: number) => string | undefined;
    if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
      colorScale = scaleLinear()
                    .domain([
                      aggregateIndustryDataMap.data.globalMinMax.minYearsEducation,
                      aggregateIndustryDataMap.data.globalMinMax.maxYearsEducation,
                    ])
                    .range(educationColorRange as any) as any;
    } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
      colorScale = scaleLinear()
                    .domain([
                      aggregateIndustryDataMap.data.globalMinMax.minHourlyWage,
                      aggregateIndustryDataMap.data.globalMinMax.maxHourlyWage,
                    ])
                    .range(wageColorRange as any) as any;
    } else {
      colorScale = () => undefined;
    }
    for(const i in treeMapData) {
      if (treeMapData[i] !== undefined) {
        let fill: string | undefined;
        if ((colorBy === ColorBy.education|| colorBy === ColorBy.wage) && aggregateIndustryDataMap.data) {
          const target = aggregateIndustryDataMap.data.industries[treeMapData[i].id];
          const targetValue = colorBy === ColorBy.education ? target.yearsEducationRank : target.hourlyWageRank;
          fill = colorScale(targetValue);
        }
        treeMapData[i].fill = fill;
      }
    }
    if (!treeMapData.length) {
      indicator.text = getString('global-ui-estimated-total-employees') + ': ―';
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
            [getString('global-ui-naics-code') + ':', industry.code],
            [getString('global-ui-year') + ':', year.toString()],
            [getString('tooltip-share-generic', {value: compositionType}) + ':', shareString],
          ];
          if (compositionType === CompositionType.Employees) {
            rows.push([
              getString('tooltip-number-generic', {value: compositionType}) + ':',
              numberWithCommas(formatNumber(Math.round(value))),
            ]);
          }
          if ((colorBy === ColorBy.education|| colorBy === ColorBy.wage) && aggregateIndustryDataMap.data) {
            const target = aggregateIndustryDataMap.data.industries[industry.naicsId];
            const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
            rows.push([
              getString('global-formatted-color-by', {type: colorBy}),
              (colorBy === ColorBy.wage ? '$' : '') + targetValue.toFixed(2),
            ]);
          }
          node.innerHTML = getStandardTooltip({
            title: industry.name ? industry.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows,
            boldColumns: [1, 2],
          });
        }
      };

      const highlightedCell = transformed.treeMapCells.find(d => d.id === highlighted);

      if (highlighted && highlightedCell) {
        const node = highlightedTooltipRef.current;
        const industry = industryMap.data[highlighted];
        const industryWithData = industries.find(({naicsId}) => naicsId === highlighted);
        if (industry && industryWithData && node) {
          const color = sectorColorMap.find(c => c.id === industry.naicsIdTopParent.toString());
          const numCompany = industryWithData.numCompany ? industryWithData.numCompany : 0;
          const numEmploy = industryWithData.numEmploy ? industryWithData.numEmploy : 0;
          const value = compositionType === CompositionType.Employees ? numEmploy : numCompany;
          const share = (value / total * 100);
          const shareString = share < 0.01 ? '<0.01%' : share.toFixed(2) + '%';
          const rows = [
            [getString('global-ui-naics-code') + ':', industry.code],
            [getString('global-ui-year') + ':', year.toString()],
            [getString('tooltip-share-generic', {value: compositionType}) + ':', shareString],
          ];
          if (compositionType === CompositionType.Employees) {
            rows.push([
              getString('tooltip-number-generic', {value: compositionType}) + ':',
              numberWithCommas(formatNumber(Math.round(value))),
            ]);
          }
          if ((colorBy === ColorBy.education|| colorBy === ColorBy.wage) && aggregateIndustryDataMap.data) {
            const target = aggregateIndustryDataMap.data.industries[industry.naicsId];
            const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
            rows.push([
              getString('global-formatted-color-by', {type: colorBy}),
              (colorBy === ColorBy.wage ? '$' : '') + targetValue.toFixed(2),
            ]);
          }
          node.innerHTML = getStandardTooltip({
            title: industry.name ? industry.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows,
            boldColumns: [1, 2],
          }) + `
           <div style="position:absolute;top: -5px;right:2px;font-size:1.1rem;">×</div>
          `;
          node.style.position = 'absolute';
          node.style.pointerEvents = 'all';
          node.style.cursor = 'pointer';
          node.style.display = 'block';
          node.style.left =
            highlightedCell.x0 + ((highlightedCell.x1 - highlightedCell.x0) / 2) + 'px';
          node.style.top = highlightedCell.y0 + 16 + 'px';
          const clearHighlighted = () => {
            props.clearHighlighted();
            node.removeEventListener('click', clearHighlighted);
          };
          node.addEventListener('click', clearHighlighted);
        }
      } else {
        const node = highlightedTooltipRef.current;
        if (node) {
          node.style.display = 'none';
        }
      }

      const highlightErrorPopup = highlighted && !highlightedCell ? (
        <QuickError
          closeError={props.clearHighlighted}
        >
          {getString('global-ui-error-industry-not-in-data-set')}
        </QuickError>
      ) : null;

      indicator.text = loading ? (
        <>
          {getString('global-ui-estimated-total-employees') + ': '}<SimpleTextLoading />
        </>
      ) : `${getString('global-ui-estimated-total-employees')}: ${numberWithCommas(formatNumber(Math.round(total)))}`;
      indicator.tooltipContent = getString('glossary-total-shown');
      const fallbackTitle =
        'Treemap displaying the economic composition of the selected city ' +
        'based on the number of ' + compositionType + ' found within the city. ' +
        'The top values are as follows: ';
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
                fallbackTitle={fallbackTitle}
              />
            </ErrorBoundary>
          </Tooltip>
          {loadingOverlay}
          {highlightErrorPopup}
        </TreeMapContainer>
      );
    }
  } else {
    output = null;
  }

  setIndicatorContent(indicator);
  return (
    <>
      <Root ref={rootRef}>
        {output}
        <RapidTooltipRoot
          ref={highlightedTooltipRef}
        />
      </Root>
    </>
  );
};

export default React.memo(CompositionTreeMap);
