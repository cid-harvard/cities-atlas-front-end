import React, {useState} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import TreeMap from './TreeMap';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {defaultYear} from '../../../../Utils';
import {ContentGrid} from '../../../../styling/styleUtils';
import {DigitLevel} from '../../../../types/graphQL/graphQLTypes';

const EconomicComposition = () => {
  const [digitLevel] = useState<DigitLevel>(DigitLevel.Three);
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
    />
  ) : <h1>No defined city</h1>;

  return (
    <DefaultContentWrapper>
      <ContentGrid>
        {treeMap}
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
