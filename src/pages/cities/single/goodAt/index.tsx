import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  defaultCompositionType,
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
import IntensityLegend from '../../../../components/dataViz/legend/IntensityLegend';
import useSectorMap from '../../../../hooks/useSectorMap';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {
  CityRoutes,
  cityIdParam,
  defaultClusterLevel,
} from '../../../../routing/routes';
import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import RCABarChart from '../../../../components/dataViz/verticalBarChart/RCABarChart';

const EconomicComposition = () => {
  const cityId = useCurrentCityId();

  const {composition_type, cluster_level} = useQueryParams();
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
  const isClusterView = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityGoodAtClusters,
  );

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  const legend = isClusterView ? <IntensityLegend /> : (
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

  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What does my City specialize in?</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ContentParagraph>
        </StandardSideTextBlock>
        <RCABarChart
          isClusterView={Boolean(isClusterView)}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          compositionType={composition_type ? composition_type : defaultCompositionType}
          hiddenSectors={hiddenSectors}
          clusterLevel={cluster_level ? cluster_level : defaultClusterLevel}
        />
        {legend}
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
