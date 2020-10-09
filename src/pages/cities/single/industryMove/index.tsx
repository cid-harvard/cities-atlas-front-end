import React, {useState} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const IndustryMove = () => {
  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const closeModal = () => setModalOpen(null);

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

  return (
    <DefaultContentWrapper>
      <h1>
        What industries can my city move to?
      </h1>
      <UtiltyBar
        onDownloadImageButtonClick={() => setModalOpen(ModalType.Download)}
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
        onSettingsButtonClick={() => setModalOpen(ModalType.Settings)}
      />
      {modal}
    </DefaultContentWrapper>
  );
};

export default IndustryMove;
