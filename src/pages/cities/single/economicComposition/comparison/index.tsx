import React, {useState} from 'react';
import TopIndustryComparisonBarChart from
  '../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart';
import IndustryZoomableBarChart from
  '../../../../../components/dataViz/zoomableComparisonBarChart/IndustryZoomableBarChart';
import {defaultYear} from '../../../../../Utils';
import {
  defaultCompositionType,
  CompositionType,
  defaultDigitLevel,
  ClassificationNaicsIndustry,
  isValidPeerGroup,
  PeerGroup,
} from '../../../../../types/graphQL/graphQLTypes';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';
import useQueryParams from '../../../../../hooks/useQueryParams';
import useFluent from '../../../../../hooks/useFluent';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import {RegionGroup} from '../../../../../components/dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import useSectorMap from '../../../../../hooks/useSectorMap';
import UtiltyBar, {DownloadType} from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import {createRoute} from '../../../../../routing/Utils';
import TrackedRoute from '../../../../../routing/TrackedRoute';
import {CityRoutes, cityIdParam} from '../../../../../routing/routes';
import DownloadTopShares from './DownloadTopShares';
import {
  useHistory,
  Switch,
  Route,
  matchPath,
} from 'react-router-dom';

interface Props {
  primaryCity: string;
  secondaryCity: string;
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity, secondaryCity,
  } = props;

  const {digit_level, composition_type} = useQueryParams();
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
  const [activeDownload, setActiveDownload] = useState<DownloadType | null>(null);
  const closeDownload = () => setActiveDownload(null);
  const getString = useFluent();
  const history = useHistory();
  const isIndustryComparison = matchPath<{[cityIdParam]: string}>(
    history.location.pathname, CityRoutes.CityEconomicCompositionIndustryCompare,
  );
  const vizNavigation= [
    {
      label: 'Top 10 Share Differences',
      active: !!(!isIndustryComparison || !isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityEconomicComposition, primaryCity)
          + history.location.search,
        );
      },
    },
    {
      label: 'Compare Industries',
      active: !!(isIndustryComparison && isIndustryComparison.isExact),
      onClick: () => {
        setHighlighted(undefined);
        history.push(
          createRoute.city(CityRoutes.CityEconomicCompositionIndustryCompare, primaryCity)
          + history.location.search,
        );
      },
    },
  ];

  let comparison: number | RegionGroup | PeerGroup;
  if (secondaryCity === RegionGroup.World) {
    comparison = RegionGroup.World;
  } else if (isValidPeerGroup(secondaryCity)) {
    comparison = secondaryCity as PeerGroup;
  } else {
    comparison = parseInt(secondaryCity, 10);
  }


  let download: React.ReactElement<any> | null;
  let triggerImageDownload: undefined | (() => void);
  if (activeDownload === DownloadType.Image) {
    download = (
        <Switch>
          <Route path={CityRoutes.CityEconomicComposition}
            render={() => (
              <DownloadTopShares
                primaryCityId={primaryCity}
                secondaryCityId={secondaryCity}
                year={defaultYear}
                onClose={closeDownload}
              />
            )}
          />
        </Switch>
    );
    triggerImageDownload = () => {
      setActiveDownload(null);
    };
  } else {
    download = null;
    triggerImageDownload = undefined;
  }

  return (
    <>
      <ContentGrid>
        <Switch>
          <TrackedRoute path={CityRoutes.CityEconomicCompositionIndustryCompare}
            render={() => (
              <IndustryZoomableBarChart
                primaryCity={parseInt(primaryCity, 10)}
                comparison={comparison}
                year={defaultYear}
                setHighlighted={setHighlighted}
                highlighted={highlighted ? parseInt(highlighted, 10) : null}
                compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
                hiddenSectors={hiddenSectors}
                vizNavigation={vizNavigation}
                triggerImageDownload={triggerImageDownload}
              />
            )}
          />
          <TrackedRoute path={CityRoutes.CityEconomicComposition}
            render={() => (
              <TopIndustryComparisonBarChart
                primaryCity={parseInt(primaryCity, 10)}
                comparison={comparison}
                year={defaultYear}
                setHighlighted={setHighlighted}
                highlighted={highlighted}
                digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
                compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
                hiddenSectors={hiddenSectors}
                vizNavigation={vizNavigation}
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
        <UtiltyBar
          onDownloadImageButtonClick={() => setActiveDownload(DownloadType.Image)}
        />
      </ContentGrid>
      {download}
    </>
  );
};

export default CompositionComparison;
