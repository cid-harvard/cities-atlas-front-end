import React, {useRef, useEffect, useState} from 'react';
import {
  useGlobalClusterMap,
} from '../../../hooks/useGlobalClusterData';
import { useQuery, gql } from '@apollo/client';
import {
  CityClusterYear,
  DigitLevel,
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
import PreChartRow, {Indicator} from '../../../components/general/PreChartRow';
import SimpleTextLoading from '../../../components/transitionStateComponents/SimpleTextLoading';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
// import {rgba} from 'polished';
import {ColorBy} from '../../../routing/routes';
import {scaleSymlog} from 'd3-scale';
import {extent} from 'd3-array';
import {intensityColorRange} from '../../../styling/styleUtils';

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
  digitLevel: DigitLevel;
  colorBy: ColorBy;
  compositionType: CompositionType;
  setHighlighted: (value: string | undefined) => void;
}

const CompositionTreeMap = (props: Props) => {
  const {
    cityId, year, digitLevel, compositionType, highlighted,
    setHighlighted,
  } = props;
  const clusterMap = useGlobalClusterMap();
  const getString = useFluent();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipContentRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const {loading, error, data} = useClusterCompositionQuery({cityId, year});

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
  if (clusterMap.loading || !dimensions || (loading && prevData === undefined)) {
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
  } else if (dataToUse !== undefined) {
    const {clusters} = dataToUse;
    const treeMapData: Inputs['data'] = [];

    const allRCAValues = clusters.map(c => {
      if (compositionType === CompositionType.Employees) {
        return c.rcaNumEmploy ? c.rcaNumEmploy : 0;
      } else {
        return c.rcaNumCompany ? c.rcaNumCompany : 0;
      }
    });

    const minMax = extent(allRCAValues) as [number, number];
    const intensityColorScale = scaleSymlog()
      .domain(minMax)
      .range(intensityColorRange as any) as unknown as (value: number) => string;

    let total = 0;
    clusters.forEach(({clusterId, numCompany, numEmploy, rcaNumCompany, rcaNumEmploy}) => {
      const industry = clusterMap.data[clusterId];
      if (industry && industry.level === digitLevel) {
        const {name, clusterIdTopParent} = industry;
        const companies = numCompany ? numCompany : 0;
        const employees = numEmploy ? numEmploy : 0;
        total = compositionType === CompositionType.Companies ? total + companies : total + employees;
        const value = compositionType === CompositionType.Companies ? companies : employees;
        const rca = (compositionType === CompositionType.Companies ? rcaNumCompany : rcaNumEmploy) as number;
        treeMapData.push({
          id: clusterId,
          value,
          title: name ? name : '',
          topLevelParentId: clusterIdTopParent ? clusterIdTopParent.toString() : clusterId.toString(),
          fill: intensityColorScale(rca),
        });
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
        const cluster = clusterMap.data[id];
        const clusterWithData = clusters.find(({clusterId}) => clusterId === id);
        if (cluster && clusterWithData && node) {
          const numCompany = clusterWithData.numCompany ? clusterWithData.numCompany : 0;
          const numEmploy = clusterWithData.numEmploy ? clusterWithData.numEmploy : 0;
          const rcaNumCompany = clusterWithData.rcaNumCompany ? clusterWithData.rcaNumCompany : 0;
          const rcaNumEmploy = clusterWithData.rcaNumEmploy ? clusterWithData.rcaNumEmploy : 0;
          const value = compositionType === CompositionType.Employees ? numEmploy : numCompany;
          const rca = (compositionType === CompositionType.Companies ? rcaNumCompany : rcaNumEmploy) as number;
          const share = (value / total * 100);
          const shareString = share < 0.01 ? '<0.01%' : share.toFixed(2) + '%';
          const rows = [
            [getString('tooltip-number-generic', {value: compositionType}) + ':', numberWithCommas(value)],
            [getString('tooltip-share-generic', {value: compositionType}) + ':', shareString],
            [getString('global-ui-naics-code') + ':', cluster.clusterId],
            [getString('global-ui-year') + ':', year.toString()],
            [getString('tooltip-intensity-generic', {value: compositionType}) + ':', rca.toFixed(3)],
          ];
          node.innerHTML = getStandardTooltip({
            title: cluster.name ? cluster.name : '',
            color: intensityColorScale(rca),
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
        searchInGraphOptions={{hiddenSectors: [], digitLevel, setHighlighted}}
        settingsOptions={{compositionType: true, colorBy: true}}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default React.memo(CompositionTreeMap);
