import React, {useRef, useEffect, useState} from 'react';
import {
  useGlobalClusterMap,
} from '../../../hooks/useGlobalClusterData';
import { useQuery, gql } from '@apollo/client';
import {
  CityClusterYear,
  DigitLevel,
  CompositionType,
  ClassificationNaicsCluster,
} from '../../../types/graphQL/graphQLTypes';
import {usePrevious} from 'react-use';
import TreeMap, {transformData, Inputs} from 'react-canvas-treemap';
import {clusterColorMap} from '../../../styling/styleUtils';
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
import {Indicator} from '../../../components/general/PreChartRow';
import SimpleTextLoading from '../../../components/transitionStateComponents/SimpleTextLoading';
import {RapidTooltipRoot, getStandardTooltip} from '../../../utilities/rapidTooltip';
import {ColorBy, ClusterLevel} from '../../../routing/routes';
import {scaleSymlog, scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';
import {intensityColorRange, educationColorRange, wageColorRange} from '../../../styling/styleUtils';
import {defaultYear, formatNumber} from '../../../Utils';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';
import {rgba} from 'polished';
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

const CLUSTER_COMPOSITION_QUERY = gql`
  query GetCityIndustryTreeData($cityId: Int!, $year: Int!) {
    clusters: cityClusterYearList(cityId: $cityId, year: $year) {
      id
      clusterId
      level
      numCompany
      numEmploy
      rcaNumCompany
      rcaNumEmploy
    }
  }
`;

interface SuccessResponse {
  clusters: {
    id: CityClusterYear['id'],
    clusterId: CityClusterYear['clusterId'],
    level: CityClusterYear['level'],
    numCompany: CityClusterYear['numCompany'],
    numEmploy: CityClusterYear['numEmploy'],
    rcaNumCompany: CityClusterYear['rcaNumCompany'],
    rcaNumEmploy: CityClusterYear['rcaNumEmploy'],
  }[];
}

interface Variables {
  cityId: number;
  year: number;
}

export const useClusterCompositionQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(CLUSTER_COMPOSITION_QUERY, { variables });

interface Props {
  cityId: number;
  year: number;
  highlighted: string | undefined;
  colorBy: ColorBy;
  compositionType: CompositionType;
  hiddenClusters: ClassificationNaicsCluster['id'][];
  clusterLevel: ClusterLevel;
  setIndicatorContent: (indicator: Indicator) => void;
  clearHighlighted: () => void;
}

const CompositionTreeMap = (props: Props) => {
  const {
    cityId, year, compositionType, highlighted,
    clusterLevel, setIndicatorContent,
    colorBy, hiddenClusters,
  } = props;
  const clusterMap = useGlobalClusterMap();
  const getString = useFluent();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const highlightedTooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useClusterCompositionQuery({cityId, year});
  const aggregateIndustryDataMap = useAggregateIndustryMap({
    level: DigitLevel.Six, year: defaultYear, clusterLevel: parseInt(clusterLevel, 10),
  });

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
  if (clusterMap.loading || !dimensions || (loading && prevData === undefined) ||
      ((colorBy === ColorBy.education || colorBy === ColorBy.wage) && aggregateIndustryDataMap.loading)) {
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
  } else if (clusterMap.error !== undefined) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(clusterMap.error);
  } else if (aggregateIndustryDataMap.error !== undefined &&
    (colorBy === ColorBy.education || colorBy === ColorBy.wage)) {
    indicator.text = getString('global-ui-total') + ': ―';
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(aggregateIndustryDataMap.error);
  } else if (dataToUse !== undefined) {
    const clusters = dataToUse.clusters.filter(c => c.level && c.level.toString() === clusterLevel);
    const treeMapData: Inputs['data'] = [];

    const allRCAValues = clusters.map(c => {
      if (compositionType === CompositionType.Employees) {
        return c.rcaNumEmploy ? c.rcaNumEmploy : 0;
      } else {
        return c.rcaNumCompany ? c.rcaNumCompany : 0;
      }
    });

    const minMax = extent(allRCAValues) as [number, number];

    let total = 0;
    clusters.forEach(({clusterId, numCompany, numEmploy}) => {
      const cluster = clusterMap.data[clusterId];
      if (cluster && cluster.level && cluster.level.toString() === clusterLevel) {
        const {name, clusterIdTopParent} = cluster;
        if (clusterIdTopParent && !hiddenClusters.includes(clusterIdTopParent.toString())) {
          const companies = numCompany ? numCompany : 0;
          const employees = numEmploy ? numEmploy : 0;
          total = compositionType === CompositionType.Companies ? total + companies : total + employees;
          const value = compositionType === CompositionType.Companies ? companies : employees;
          treeMapData.push({
            id: clusterId,
            value,
            title: name ? name : '',
            topLevelParentId: clusterIdTopParent ? clusterIdTopParent.toString() : clusterId.toString(),
          });
        }
      }
    });


    let colorScale: (val: number) => string | undefined;
    if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
      colorScale = scaleLinear()
                    .domain([
                      aggregateIndustryDataMap.data.clusterMinMax.minYearsEducation,
                      aggregateIndustryDataMap.data.clusterMinMax.meanYearsEducation,
                      aggregateIndustryDataMap.data.clusterMinMax.maxYearsEducation,
                    ])
                    .range(educationColorRange as any) as any;
    } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
      colorScale = scaleLinear()
                    .domain([
                      aggregateIndustryDataMap.data.clusterMinMax.minHourlyWage,
                      aggregateIndustryDataMap.data.clusterMinMax.meanHourlyWage,
                      aggregateIndustryDataMap.data.clusterMinMax.maxHourlyWage,
                    ])
                    .range(wageColorRange as any) as any;
    } else {
      // colorScale = () => undefined;
      colorScale = scaleSymlog()
        .domain(minMax)
        .range(intensityColorRange as any) as unknown as (value: number) => string;
    }
    for(const i in treeMapData) {
      if (treeMapData[i] !== undefined) {
        let fill: string | undefined;
        const clusterIndustryDatum = aggregateIndustryDataMap.data.clusters[treeMapData[i].id];
        if (colorBy === ColorBy.education && aggregateIndustryDataMap.data !== undefined) {
          if (clusterIndustryDatum) {
            fill = colorScale(clusterIndustryDatum.yearsEducationRank) as string;
          } else {
            fill = 'gray';
          }
        } else if (colorBy === ColorBy.wage && aggregateIndustryDataMap.data !== undefined) {
          if (clusterIndustryDatum) {
            fill = colorScale(clusterIndustryDatum.hourlyWageRank) as string;
          } else {
            fill = 'gray';
          }
        } else {
          fill = undefined;
        }
        treeMapData[i].fill = fill;
      }
    }

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
        colorMap: clusterColorMap,
      });
      const loadingOverlay = loading ? <LoadingBlock /> : null;
      const onHover = (id: string) => {
        const node = tooltipContentRef.current;
        const cluster = clusterMap.data[id];
        const clusterWithData = clusters.find(({clusterId}) => clusterId === id);
        if (cluster && clusterWithData && node) {
          const numCompany = clusterWithData.numCompany ? clusterWithData.numCompany : 0;
          const numEmploy = clusterWithData.numEmploy ? clusterWithData.numEmploy : 0;
          const value = compositionType === CompositionType.Employees ? numEmploy : numCompany;
          const share = (value / total * 100);
          const shareString = share < 0.01 ? '<0.01%' : share.toFixed(2) + '%';
          const color = clusterColorMap.find(c => cluster.clusterIdTopParent && c.id === cluster.clusterIdTopParent.toString());
          const rows = [
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
            const target = aggregateIndustryDataMap.data.clusters[cluster.clusterId];
            const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
            rows.push([
              getString('global-formatted-color-by', {type: colorBy}),
              (colorBy === ColorBy.wage ? '$' : '') + targetValue.toFixed(2),
            ]);
          }
          node.innerHTML = getStandardTooltip({
            title: cluster.name ? cluster.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows,
            boldColumns: [1, 2],
          });
        }
      };


      const highlightedCell = transformed.treeMapCells.find(d => d.id === highlighted);

      if (highlighted && highlightedCell) {
        const node = highlightedTooltipRef.current;
        const cluster = clusterMap.data[highlighted];
        const clusterWithData = clusters.find(({clusterId}) => clusterId === highlighted);
        if (cluster && clusterWithData && node) {
          const numCompany = clusterWithData.numCompany ? clusterWithData.numCompany : 0;
          const numEmploy = clusterWithData.numEmploy ? clusterWithData.numEmploy : 0;
          const value = compositionType === CompositionType.Employees ? numEmploy : numCompany;
          const share = (value / total * 100);
          const shareString = share < 0.01 ? '<0.01%' : share.toFixed(2) + '%';
          const color = clusterColorMap.find(c => cluster.clusterIdTopParent && c.id === cluster.clusterIdTopParent.toString());
          const rows = [
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
            const target = aggregateIndustryDataMap.data.clusters[cluster.clusterId];
            const targetValue = colorBy === ColorBy.education ? target.yearsEducation : target.hourlyWage;
            rows.push([
              getString('global-formatted-color-by', {type: colorBy}),
              (colorBy === ColorBy.wage ? '$' : '') + targetValue.toFixed(2),
            ]);
          }
          node.innerHTML = getStandardTooltip({
            title: cluster.name ? cluster.name : '',
            color: color ? rgba(color.color, 0.3) : '#fff',
            rows,
            boldColumns: [1, 2],
          }) + `
           <div style="position:absolute;top: 2px;right:2px;">×</div>
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
