import React, {useState} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import TreeMap, {CompositionType} from './TreeMap';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';
import {
  ContentGrid,
  secondaryFont,
} from '../../../../styling/styleUtils';
import {DigitLevel} from '../../../../types/graphQL/graphQLTypes';
import SectorLabels from '../../../../components/dataViz/SectorLabels';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';

import styled from 'styled-components/macro';

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
`;

const EconomicComposition = () => {
  const [digitLevel, setDigitLevel] = useState<DigitLevel>(DigitLevel.Three);
  const [compositionType, setCompositionType] = useState<CompositionType>(CompositionType.Companies);
  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const closeModal = () => setModalOpen(null);
  const cityId = useCurrentCityId();

  let modal: React.ReactElement<any> | null;
  if (modalOpen === ModalType.Download) {
    modal = (
      <BasicModal onClose={closeModal} width={'auto'} height={'auto'}>
        <h1>Download image or data</h1>
      </BasicModal>
    );
  }else if (modalOpen === ModalType.Data) {
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

  const treeMap = cityId !== null ? (
    <TreeMap
      cityId={parseInt(cityId, 10)}
      year={defaultYear}
      digitLevel={digitLevel}
      compositionType={compositionType}
    />
  ) : <SimpleError />;

  return (
    <DefaultContentWrapper>
      <ContentGrid>
        <StandardSideTextBlock>
          <h2>Employment &amp; Industry Composition</h2>
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
        </StandardSideTextBlock>
        {treeMap}
        <SectorLabels />
      </ContentGrid>
      <UtiltyBar
        onDownloadButtonClick={() => setModalOpen(ModalType.Download)}
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
        onSettingsButtonClick={() => setModalOpen(ModalType.Settings)}
      />
      {modal}
    </DefaultContentWrapper>
  );
};

export default EconomicComposition;
