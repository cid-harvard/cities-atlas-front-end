import React, {useState, useRef} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import CompositionTreeMap, {
  CompositionType,
} from '../../../../components/dataViz/treeMap/CompositionTreeMap';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';
import {
  ContentGrid,
  secondaryFont,
  lightBaseColor,
  backgroundMedium,
  tertiaryColor,
} from '../../../../styling/styleUtils';
import {DigitLevel, ClassificationNaicsIndustry} from '../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../components/dataViz/legend/CategoryLabels';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import styled from 'styled-components/macro';
import SimpleLoader from '../../../../components/transitionStateComponents/SimpleLoader';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';
import {
  useGlobalIndustryHierarchicalTreeData,
} from '../../../../hooks/useGlobalIndustriesData';
import useGlobalLocationData from '../../../../hooks/useGlobalLocationData';
import useFluent from '../../../../hooks/useFluent';
import useSectorMap from '../../../../hooks/useSectorMap';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import DownloadImageOverlay from './DownloadImageOverlay';
import noop from 'lodash/noop';

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.label`
  font-size: 0.8rem;
  text-transform: uppercase;
  font-family: ${secondaryFont};
  display: block;
`;

const Select = styled.select`
  padding: 0.4rem;
  font-family: ${secondaryFont};
  font-size: 1.1rem;
  cursor: pointer;
  text-align: center;
  margin-bottom: 2rem;
  border: solid 1px ${lightBaseColor};
  border-radius: 0;
`;

const SearchContainer = styled.div`
  max-width: 280px;
  width: 100%;
  font-family: ${secondaryFont};
  margin-bottom: 2rem;

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-search-icon {
    display: none;
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 1rem;
    border: solid 1px ${lightBaseColor};
    box-shadow: none;
    outline: none;
    padding: 0.4rem 0.5rem;

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
  }

  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: ${lightBaseColor};
    }
  }
  .react-panel-search-search-bar-dropdown-arrow {
    width: 1rem;
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: ${lightBaseColor};
    }
  }

  .react-panel-search-search-results {
    border-left: solid 1px ${lightBaseColor};
    border-right: solid 1px ${lightBaseColor};
    border-bottom: solid 1px ${lightBaseColor};
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    border-color: ${tertiaryColor};
  }
`;

const TreeMapRoot = styled.div`
  display: contents;
`;

const EconomicComposition = () => {
  const [digitLevel, setDigitLevel] = useState<DigitLevel>(DigitLevel.Three);
  const [compositionType, setCompositionType] = useState<CompositionType>(CompositionType.Companies);
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const sectorMap = useSectorMap();
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);
  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const closeModal = () => setModalOpen(null);
  const cityId = useCurrentCityId();
  const industrySearchData = useGlobalIndustryHierarchicalTreeData();
  const getString = useFluent();
  const treeMapRef = useRef<HTMLDivElement | null>(null);
  const globalLocationData = useGlobalLocationData();

  let modal: React.ReactElement<any> | null;
  if (modalOpen === ModalType.Download && cityId !== null && treeMapRef.current) {
    const cellsNode = treeMapRef.current.querySelector('div.react-canvas-tree-map-masterContainer');
    if (cellsNode) {
      const targetCity = globalLocationData.data && globalLocationData.data.cities.find(c => c.cityId === cityId);
      modal = (
        <DownloadImageOverlay
          onClose={closeModal}
          cityId={parseInt(cityId, 10)}
          cityName={targetCity && targetCity.name ? targetCity.name : undefined}
          year={defaultYear}
          digitLevel={digitLevel}
          compositionType={compositionType}
          hiddenSectors={hiddenSectors}
          treeMapCellsNode={cellsNode as HTMLDivElement}
        />
      );
    } else {
      modal = null;
      setModalOpen(null);
    }
  } else if (modalOpen === ModalType.Data) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>Display data disclaimer</h1>
      </BasicModal>
    );
  } else if (modalOpen === ModalType.Settings) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>Adjust Visualization Settings</h1>
      </BasicModal>
    );
  } else {
    modal = null;
  }

  let searchPanel: React.ReactElement<any> | null;
  if (industrySearchData.loading) {
    searchPanel = (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (industrySearchData.error !== undefined) {
    console.error(industrySearchData.error);
    searchPanel = (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if (hiddenSectors.length === sectorMap.length) {
    searchPanel = (
      <LoadingContainer>
        <SimpleError fluentMessageId={'error-message-no-industries'} />
      </LoadingContainer>
    );
  } else if (industrySearchData.data !== undefined) {
    const onSelect = (d: {id: string | number} | null) => {
      if (d) {
        setHighlighted(d.id as string);
      } else {
        setHighlighted(undefined);
      }
    };
    const searchData: SearchDatum[] = industrySearchData.data.filter(
      ({level, id}) => level <= digitLevel && !hiddenSectors.includes(id as string),
    );
    const disallowSelectionLevels = digitLevel
      ? Array.from(Array(digitLevel).keys()) : undefined;
    searchPanel = (
      <PanelSearch
        data={searchData}
        topLevelTitle={getString('global-text-industries')}
        disallowSelectionLevels={disallowSelectionLevels}
        defaultPlaceholderText={getString('global-ui-type-an-industry')}
        showCount={true}
        resultsIdentation={1.75}
        onSelect={onSelect}
        maxResults={500}
      />
    );
  } else {
    searchPanel = null;
  }

  let treeMap: React.ReactElement<any>;
  if (cityId !== null) {
    treeMap = (
      <TreeMapRoot ref={treeMapRef}>
        <CompositionTreeMap
          cityId={parseInt(cityId, 10)}
          year={defaultYear}
          digitLevel={digitLevel}
          compositionType={compositionType}
          highlighted={highlighted}
          hiddenSectors={hiddenSectors}
        />
      </TreeMapRoot>
    );
  } else {
    treeMap = (
      <LoadingOverlay>
        <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
      </LoadingOverlay>
    );
  }

  return (
    <DefaultContentWrapper>
      <ContentGrid>
        <StandardSideTextBlock>
          <h2>Employment &amp; Industry Composition</h2>

          <Label>Find in graph</Label>
          <SearchContainer>
            {searchPanel}
          </SearchContainer>

          <Label>Digit Level</Label>
          <Select value={digitLevel} onChange={(e) => setDigitLevel(parseInt(e.target.value, 10))}>
            <option value='1'>1 (Sector)</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
          </Select>

          <Label>Values based on number of</Label>
          <Select value={compositionType} onChange={(e) => setCompositionType(e.target.value as CompositionType)}>
            <option value={CompositionType.Companies}>{CompositionType.Companies}</option>
            <option value={CompositionType.Employees}>{CompositionType.Employees}</option>
          </Select>
          {/* eslint-disable-next-line */}
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

          {/* eslint-disable-next-line */}
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

          {/* eslint-disable-next-line */}
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>


        </StandardSideTextBlock>
        {treeMap}
        <CategoryLabels
          categories={sectorMap}
          toggleCategory={toggleSector}
          isolateCategory={isolateSector}
          hiddenCategories={hiddenSectors}
        />
      </ContentGrid>
      <UtiltyBar
        onDownloadImageButtonClick={
          cityId !== null && treeMapRef.current ? () => setModalOpen(ModalType.Download) : noop
        }
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
        onSettingsButtonClick={() => setModalOpen(ModalType.Settings)}
      />
      {modal}
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
