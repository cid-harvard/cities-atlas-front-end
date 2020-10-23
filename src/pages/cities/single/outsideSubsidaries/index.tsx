import React, {useState} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import FullPageMap from './FullPageMap';

const OutsideSubsidaries = () => {
  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const closeModal = () => setModalOpen(null);

  let modal: React.ReactElement<any> | null;
  if (modalOpen === ModalType.DownloadImage) {
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
  } else {
    modal = null;
  }

  return (
    <>
      <h1>
        What cities own/host subsidaries in and from my city?
      </h1>
      <UtiltyBar
        onDownloadImageButtonClick={() => setModalOpen(ModalType.DownloadImage)}
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
      />
      {modal}
      <FullPageMap />
    </>
  );
};

export default OutsideSubsidaries;