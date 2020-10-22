import React, {useState} from 'react';
import BasicModal from '../../../../components/standardModal/BasicModal';
import UtiltyBar, {ModalType} from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const CompareSelf = () => {
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
    <DefaultContentWrapper>
      <h1>
        What cities should I compare myself to?
      </h1>
      <UtiltyBar
        onDownloadImageButtonClick={() => setModalOpen(ModalType.DownloadImage)}
        onDataButtonClick={() => setModalOpen(ModalType.Data)}
      />
      {modal}
    </DefaultContentWrapper>
  );
};

export default CompareSelf;
