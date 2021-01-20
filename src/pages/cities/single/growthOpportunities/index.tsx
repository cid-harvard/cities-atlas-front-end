import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  defaultCompositionType,
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
} from '../../../../routing/routes';
import {
  useHistory,
  Switch,
  Route,
  matchPath,
} from 'react-router-dom';
import PSWOTChart from '../../../../components/dataViz/pswotChart/';

const EconomicComposition = () => {
  const cityId = useCurrentCityId();

  const {composition_type} = useQueryParams();
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

  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What are the Growth Opportunities in my City?<br />SWOT Analysis</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ContentParagraph>
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
                compositionType={composition_type ? composition_type : defaultCompositionType}
                vizNavigation={vizNavigation}
                hiddenSectors={hiddenSectors}
              />
            )}
          />
        </Switch>
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
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;