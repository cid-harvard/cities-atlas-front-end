import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  ClassificationNaicsIndustry,
  CompositionType,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  usePrevious,
} from 'react-use';
import {useWindowWidth} from '../../../contextProviders/appContext';
import {breakPoints} from '../../../styling/GlobalGrid';
import PreChartRow, {VizNavItem} from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import {
  sectorColorMap,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import PSwotPlot, {
  Datum,
} from 'react-pswot-plot';
import useRCAData, {
  SuccessResponse,
} from './useRCAData';
// import useFluent from '../../../hooks/useFluent';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 4rem 1fr 2rem;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const SizingContainer = styled.div`
  width: 100%;
  grid-row: 2;
`;

const VizContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  .cluster-bar-chart-y-axis-label {
    text-transform: uppercase;
    font-size: 0.75rem;
  }
`;

interface Props {
  highlighted: string | null;
  setHighlighted: (value: string | undefined) => void;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
}

const IndustryZoomableBarChart = (props: Props) => {
  const {
    compositionType, hiddenSectors, setHighlighted, vizNavigation, digitLevel,
  } = props;

  const {loading, error, data} = useRCAData(digitLevel);
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  // const getString = useFluent();

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);

  // const highlightIndustry = highlighted ? industryMap.data[highlighted] : undefined;

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const industries = useGlobalIndustryMap();

  const setHovered = (datum: {label: string, fill?: string, id?: string, x?: number, y?: number}, coords: {x: number, y: number}) => {
    const node = tooltipRef.current;
    const industry = industries && industries.data && datum.id ? industries.data[datum.id] : undefined;
    if (node) {
      const rows: string[][] = [];
      if (industry && industry.code) {
        rows.push(
          ['Code', industry.code],
        );
      } else {
        rows.push(
          ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
        );
      }
      if (datum.x !== undefined) {
        rows.push(
          ['RCA', parseFloat(datum.x.toFixed(3)).toString() ],
        );
      }
      if (datum.y) {
        rows.push(
          ['Density', parseFloat(datum.y.toFixed(3)).toString() ],
        );
      }
      node.innerHTML = getStandardTooltip({
        title: datum.label,
        color: datum.fill ? rgba(datum.fill, 0.5) : '#f69c7c',
        rows,
        boldColumns: [1],
      });
      node.style.top = coords.y + 'px';
      node.style.left = coords.x + 'px';
      node.style.display = 'block';
    }
  };

  const removeHovered = useCallback(() => {
    const node = tooltipRef.current;
    if (node) {
      node.style.display = 'none';
    }
  }, [tooltipRef]);

  useEffect(() => {
    removeHovered();
  }, [data, removeHovered]);


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
    const {nodeRca} = dataToUse;

    const pswotChartData: Datum[] = nodeRca.map(n => {
      const industry = industries && industries.data && n.naicsId ? industries.data[n.naicsId] : undefined;
      const naicsId = industry ? industry.naicsId : '';
      const parentColor = sectorColorMap.find(c => industry && c.id === industry.naicsIdTopParent.toString());
      const x = compositionType === CompositionType.Employees
        ? (n.rcaNumEmploy !== null ? n.rcaNumEmploy : 0)
        : (n.rcaNumCompany !== null ? n.rcaNumCompany : 0);
      const y = compositionType === CompositionType.Employees
        ? (n.densityEmploy !== null ? n.densityEmploy : 0)
        : (n.densityCompany !== null ? n.densityCompany : 0);
      return {
        id: naicsId,
        label: industry && industry.name ? industry.name : naicsId,
        x,
        y,
        fill: parentColor ? parentColor.color : undefined,
        // highlighted: !Math.round(Math.random()),
        // faded: !Math.round(Math.random()),
        onMouseMove: setHovered,
        onMouseLeave: removeHovered,
      };
    });
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    output = (
      <VizContainer style={{height: dimensions.height}}>
        <ErrorBoundary>
          <PSwotPlot
            id={'react-pswot-plot-demo'}
            data={pswotChartData}
            averageLineText={'Relative Advantage = 1'}
            quadrantLabels={{
              I: 'Strength',
              II: 'Opportunity',
              III: 'Threat',
              IV: 'Weakness',
              V: 'Potential',
            }}
            quadrantBackgroundColors={{
              I: '#dadbdd',
              II: '#e6e7e8',
              III: '#f2f3f3',
              IV: '#fafafb',
              V: '#edf6f4',
            }}
            zeroAxisLabel={'Relative Advantage = 0'}
            axisLabels={{
              left: 'Predicted Density Change',
              leftUp: 'Growing',
              leftDown: 'Decreasing',
              bottomLeft: 'Low Relative Advantage',
              bottomRight: 'High Relative Advantage',
            }}
            axisLabelColor={'#333'}
            quadrantLabelColor={'#f69c7c'}
            onQuadrantLabelMouseMove={setHovered}
            onQuadrantLabelMouseLeave={removeHovered}
          />
        </ErrorBoundary>
        {loadingOverlay}
      </VizContainer>
    );
  } else {
    output = null;
  }
  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenSectors,
          digitLevel,
          setHighlighted,
        }}
        settingsOptions={{compositionType: true}}
        vizNavigation={vizNavigation}
      />
      <Root>
        <SizingContainer ref={rootRef}>
          {output}
        </SizingContainer>
      </Root>
      <RapidTooltipRoot ref={tooltipRef} />
    </>
  );
};

export default IndustryZoomableBarChart;