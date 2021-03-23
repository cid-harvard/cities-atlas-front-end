import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
} from '../../../../types/graphQL/graphQLTypes';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import useQueryParams from '../../../../hooks/useQueryParams';
import useFluent from '../../../../hooks/useFluent';
import CategoryLabels from '../../../../components/dataViz/legend/CategoryLabels';
import useSectorMap from '../../../../hooks/useSectorMap';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {createRoute} from '../../../../routing/Utils';
import {
  CityRoutes,
  cityIdParam,
  ColorBy,
} from '../../../../routing/routes';
import {
  useHistory,
  Switch,
  Route,
  matchPath,
} from 'react-router-dom';
import PSWOTChart from '../../../../components/dataViz/pswotChart/';
import IntensityLegend from '../../../../components/dataViz/legend/IntensityLegend';
import EducationLegend from '../../../../components/dataViz/legend/EducationLegend';
import WageLegend from '../../../../components/dataViz/legend/WageLegend';

const GrowthOppurtunities = () => {
  const cityId = useCurrentCityId();

  const {node_sizing, color_by} = useQueryParams();
  const sectorMap = useSectorMap();
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);
  const resetSectors = () => setHiddenSectors([]);
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const getString = useFluent();
  const history = useHistory();
  const isTableView = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityGrowthOpportunitiesTable,
  );
  const vizNavigation= [
    {
      label: 'Scatter Plot',
      active: !!(!isTableView || !isTableView.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityGrowthOpportunities, cityId ? cityId :'')
          + history.location.search,
        );
      },
    },
    {
      label: 'Table of Industries',
      active: !!(isTableView && isTableView.isExact),
      onClick: () => {
        window.open('https://citiestool.invisionapp.com/console/share/8D23T0CCJG/498711467', '_blank');
        // setHighlighted(undefined);
        // history.push(
        //   createRoute.city(CityRoutes.CityGrowthOpportunitiesTable, cityId ? cityId :'')
        //   + history.location.search,
        // );
      },
    },
  ];

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  let legend: React.ReactElement<any> | null;
  if (color_by === ColorBy.intensity) {
    legend = (
      <IntensityLegend />
    );
  } else if (color_by === ColorBy.education) {
    legend = (
      <EducationLegend />
    );
  } else if (color_by === ColorBy.wage) {
    legend = (
      <WageLegend />
    );
  } else {
    legend = (
      <CategoryLabels
        categories={sectorMap}
        allowToggle={true}
        toggleCategory={toggleSector}
        isolateCategory={isolateSector}
        hiddenCategories={hiddenSectors}
        resetCategories={resetSectors}
        resetText={getString('global-ui-reset-sectors')}
        fullWidth={true}
      />
    );
  }


  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What are the Growth Opportunities in my City?</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>{'Building on all these measures, we can rank industries not only by their relative size in <City>, but by their predicted future growth. These measures can help analysts make sense not only of <City>\'s economic strengths and weaknesses, but to assess growth opportunities and contraction threats. <City>\'s strengths concentrate in sector <Sec>, while its weaknesses concentrate in <Sec>. <City> has great opportunities in <Sec>, but faces threats in <Sec>.'}</ContentParagraph>
        </StandardSideTextBlock>
        <Switch>
          <Route path={CityRoutes.CityGrowthOpportunitiesTable}
            render={() => (
              <div>Table</div>
            )}
          />
          <Route path={CityRoutes.CityGrowthOpportunities}
            render={() => (
              <PSWOTChart
                highlighted={highlighted ? highlighted : null}
                setHighlighted={setHighlighted}
                digitLevel={DigitLevel.Six}
                vizNavigation={vizNavigation}
                hiddenSectors={hiddenSectors}
                nodeSizing={node_sizing}
                colorBy={color_by ? color_by : ColorBy.sector}
              />
            )}
          />
        </Switch>
        {legend}
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default GrowthOppurtunities;
