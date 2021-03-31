import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  ClassificationNaicsIndustry,
  DigitLevel,
} from '../../../types/graphQL/graphQLTypes';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  useAggregateIndustryMap,
} from '../../../hooks/useAggregateIndustriesData';
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
  educationColorRange,
  wageColorRange,
  intensityColorRange,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import PSwotPlot, {
  Datum,
} from 'react-pswot-plot';
import useRCAData, {
  SuccessResponse,
} from '../../../hooks/useRCAData';
import useFluent from '../../../hooks/useFluent';
import {NodeSizing, ColorBy} from '../../../routing/routes';
import {getStandardTooltip, RapidTooltipRoot} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';
import {defaultYear} from '../../../Utils';
import {scaleLinear, scaleSymlog} from 'd3-scale';
import {extent} from 'd3-array';
import orderBy from 'lodash/orderBy';
import QuickError from '../../transitionStateComponents/QuickError';
import {Mode} from '../../general/searchIndustryInGraphDropdown';

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

const SizingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  nodeSizing: NodeSizing | undefined;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  vizNavigation: VizNavItem[];
  colorBy: ColorBy;
}

const PSWOTChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted, vizNavigation, digitLevel,
    highlighted, nodeSizing, colorBy,
  } = props;

  const {loading, error, data} = useRCAData(digitLevel);
  const aggregateIndustryDataMap = useAggregateIndustryMap({level: digitLevel, year: defaultYear});
  const windowDimensions = useWindowWidth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  const getString = useFluent();

  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
    }
  }, [rootRef, windowDimensions]);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const industries = useGlobalIndustryMap();

  const highlightIndustry = highlighted ? industries.data[highlighted] : undefined;

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
  if (industries.loading || aggregateIndustryDataMap.loading ||
      !dimensions || (loading && prevData === undefined)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (industries.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (aggregateIndustryDataMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined &&
      aggregateIndustryDataMap && aggregateIndustryDataMap.data &&
      industries && industries.data
    ) {
    const {naicsRca, naicsData} = dataToUse;

    const pswotChartData: Datum[] = [];
    const {globalMinMax} = aggregateIndustryDataMap.data;
    let radiusScale: (value: number) => number | undefined;
    if (nodeSizing === NodeSizing.companies) {
      const minSizeBy = globalMinMax && globalMinMax.minSumNumCompany
            ? globalMinMax.minSumNumCompany : 0;
      const maxSizeBy = globalMinMax && globalMinMax.maxSumNumCompany
            ? globalMinMax.maxSumNumCompany : 1;
      radiusScale = scaleLinear()
        .domain([minSizeBy, maxSizeBy])
        .range([ 4, 16 ]);
    } else if (nodeSizing === NodeSizing.employees) {
      const minSizeBy = globalMinMax && globalMinMax.minSumNumEmploy
            ? globalMinMax.minSumNumEmploy : 0;
      const maxSizeBy = globalMinMax && globalMinMax.maxSumNumEmploy
            ? globalMinMax.maxSumNumEmploy : 1;
      radiusScale = scaleLinear()
        .domain([minSizeBy, maxSizeBy])
        .range([ 4, 16 ]);
    } else if (nodeSizing === NodeSizing.wage) {
      const minSizeBy = globalMinMax && globalMinMax.minHourlyWage
            ? globalMinMax.minHourlyWage : 0;
      const maxSizeBy = globalMinMax && globalMinMax.maxHourlyWage
            ? globalMinMax.maxHourlyWage : 1;
      radiusScale = scaleLinear()
        .domain([minSizeBy, maxSizeBy])
        .range([ 4, 16]);
    } else if (nodeSizing === NodeSizing.education) {
      const minSizeBy = globalMinMax && globalMinMax.minYearsEducation
            ? globalMinMax.minYearsEducation : 0;
      const maxSizeBy = globalMinMax && globalMinMax.maxYearsEducation
            ? globalMinMax.maxYearsEducation : 1;
      radiusScale = scaleLinear()
        .domain([minSizeBy, maxSizeBy])
        .range([ 2, 10]);
    } else {
      radiusScale = (_unused: number) => 5.5;
    }
    let colorScale: (value: number) => string | undefined;
    if (colorBy === ColorBy.intensity) {
      const allRca = naicsRca.map(n => {
        return n && n.rca !== null ? n.rca : 0;
      });
      const [minRca, maxRca] = extent(allRca) as [number, number];
      colorScale = scaleSymlog()
        .domain([minRca, maxRca])
        .range(intensityColorRange as any) as unknown as (value: number) => string;
    } else if (colorBy === ColorBy.education) {
      const {minYearsEducation, maxYearsEducation} = globalMinMax;
      colorScale = scaleLinear()
        .domain([minYearsEducation, maxYearsEducation])
        .range(educationColorRange as any) as any;
    } else if (colorBy === ColorBy.wage) {
      const {minHourlyWage, maxHourlyWage} = globalMinMax;
      colorScale = scaleLinear()
        .domain([minHourlyWage, maxHourlyWage])
        .range(wageColorRange as any) as any;
    } else {
      colorScale = () => undefined;
    }

    let highlightError = Boolean(highlighted && !naicsRca.find(
      d => d.naicsId !== null && d.naicsId.toString() === highlighted.toString()));

    naicsRca.forEach(n => {
      const industry = n.naicsId ? industries.data[n.naicsId] : undefined;
      const industryGlobalData = n.naicsId ? aggregateIndustryDataMap.data.industries[n.naicsId] : undefined;
      const naicsId = industry ? industry.naicsId : '';
      const sector = sectorColorMap.find(c => industry && c.id === industry.naicsIdTopParent.toString());
      const datum = naicsData.find(nn => n.naicsId !== null && nn.naicsId.toString() === n.naicsId.toString());
      if (sector && datum && !hiddenSectors.includes(sector.id)) {
        const x = n.rca !== null ? n.rca : 0;
        const y = datum.densityEmploy !== null ? datum.densityEmploy : 0;

        let radius: number;
        if (nodeSizing === NodeSizing.companies) {
          radius = radiusScale(industryGlobalData && industryGlobalData.sumNumCompany
              ? industryGlobalData.sumNumCompany : 0) as number;
        } else if (nodeSizing === NodeSizing.employees) {
          radius = radiusScale(industryGlobalData && industryGlobalData.sumNumEmploy
              ? industryGlobalData.sumNumEmploy : 0) as number;
        } else if (nodeSizing === NodeSizing.wage) {
          radius = radiusScale(industryGlobalData && industryGlobalData.hourlyWage
              ? industryGlobalData.hourlyWage : 0) as number;
        } else if (nodeSizing === NodeSizing.education) {
          radius = radiusScale(industryGlobalData && industryGlobalData.yearsEducation
              ? industryGlobalData.yearsEducation : 0) as number;
        } else {
          radius = 5.5;
        }

        let fill: string | undefined;
        if (colorBy === ColorBy.intensity) {
          fill = colorScale(x < 0.001 ? parseFloat(x.toFixed(3)) : x);
        } else if (colorBy === ColorBy.education) {
          fill = colorScale(industryGlobalData ? industryGlobalData.yearsEducation : 0);
        } else if (colorBy === ColorBy.wage) {
          fill = colorScale(industryGlobalData ? industryGlobalData.hourlyWage : 0);
        } else {
          fill = sector ? rgba(sector.color, 0.7) : undefined;
        }
        pswotChartData.push({
          id: naicsId,
          label: industry && industry.name ? industry.name : naicsId,
          x,
          y,
          radius,
          fill,
          highlighted: highlightIndustry && highlightIndustry.naicsId === naicsId,
          faded: !highlightError && highlightIndustry && highlightIndustry.naicsId !== naicsId,
          onMouseMove: setHovered,
          onMouseLeave: removeHovered,
        });
        highlightError =
          highlightError || (highlightIndustry && highlightIndustry.naicsId === naicsId && x === 0 && y < 1)
          ? true : false;
      }
    });

    const sortedData = orderBy(pswotChartData, ['radius'], ['desc']);

    const loadingOverlay = loading ? <LoadingBlock /> : null;

    const highlightErrorPopup = highlightError ? (
      <QuickError
        closeError={() => setHighlighted(undefined)}
      >
        {getString('global-ui-error-industry-not-in-data-set')}
      </QuickError>
    ) : null;

    output = (
      <VizContainer style={{height: dimensions.height}}>
        <ErrorBoundary>
          <PSwotPlot
            id={'react-pswot-plot-demo'}
            data={sortedData}
            averageLineText={getString('pswot-average-line-text')}
            quadrantLabels={{
              I: getString('pswot-quadrant-labels-i'),
              II: getString('pswot-quadrant-labels-ii'),
              III: getString('pswot-quadrant-labels-iii'),
              IV: getString('pswot-quadrant-labels-iv'),
              V: 'Possible\nEntrants',
            }}
            quadrantBackgroundColors={{
              I: '#dadbdd',
              II: '#e6e7e8',
              III: '#f2f3f3',
              IV: '#fafafb',
              V: '#edf6f4',
            }}
            zeroAxisLabel={getString('pswot-zero-axis-label')}
            axisLabels={{
              left: getString('pswot-axis-labels-left'),
              leftUp: dimensions.height > 400 ? getString('pswot-axis-labels-left-up') : '',
              leftDown: dimensions.height > 400 ? getString('pswot-axis-labels-left-down') : '',
              bottomLeft: getString('pswot-axis-labels-bottom-left'),
              bottomRight: getString('pswot-axis-labels-bottom-right'),
            }}
            axisLabelColor={'#333'}
            quadrantLabelColor={'#f69c7c'}
            onQuadrantLabelMouseMove={setHovered}
            onQuadrantLabelMouseLeave={removeHovered}
          />
        </ErrorBoundary>
        {loadingOverlay}
        {highlightErrorPopup}
      </VizContainer>
    );
  } else {
    output = null;
  }
  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: hiddenSectors,
          digitLevel,
          clusterLevel: null,
          setHighlighted,
          mode: Mode.naics,
        }}
        settingsOptions={{compositionType: true, nodeSizing: true, colorBy: {nodes: true}, digitLevel: {
          sixDigitOnlyMessage: getString('glossary-digit-level-disabled-swot'),
        }}}
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

export default PSWOTChart;