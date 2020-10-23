import React, {useState, useRef} from 'react';
import BasicModal from '../../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import CompositionTreeMap, {
  CompositionType,
} from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import useCurrentCityId from '../../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
  secondaryFont,
  lightBaseColor,
} from '../../../../../styling/styleUtils';
import {DigitLevel, ClassificationNaicsIndustry} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import SimpleError from '../../../../../components/transitionStateComponents/SimpleError';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import styled from 'styled-components/macro';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useSectorMap from '../../../../../hooks/useSectorMap';
import {LoadingOverlay} from '../../../../../components/transitionStateComponents/VizLoadingBlock';
import DownloadImageOverlay from './DownloadImageOverlay';
import noop from 'lodash/noop';


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
  const treeMapRef = useRef<HTMLDivElement | null>(null);
  const globalLocationData = useGlobalLocationData();

  let modal: React.ReactElement<any> | null;
  if (modalOpen === ModalType.DownloadImage && cityId !== null && treeMapRef.current) {
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
  } else if (modalOpen === ModalType.DownloadData) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>DownloadData</h1>
      </BasicModal>
    );
  } else if (modalOpen === ModalType.HowToRead) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>Read this Chart</h1>
      </BasicModal>
    );
  } else if (modalOpen === ModalType.Settings) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>Viz Settings</h1>
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
      </BasicModal>
    );
  } else {
    modal = null;
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
          openVizSettingsModal={() => setModalOpen(ModalType.Settings)}
          openHowToReadModal={() => setModalOpen(ModalType.HowToRead)}
          setHighlighted={setHighlighted}
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
    <>
      <ContentGrid>
        <StandardSideTextBlock>
          <h2>Employment &amp; Industry Composition</h2>

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
          cityId !== null && treeMapRef.current ? () => setModalOpen(ModalType.DownloadImage) : noop
        }
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
        onDownloadDataButtonClick={() => setModalOpen(ModalType.DownloadData)}
      />
      {modal}
    </>
  );
};

export default EconomicComposition;
