import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import FullPageMap from './FullPageMap';

const OutsideSubsidaries = () => {
  return (
    <>
      <h1>
        What cities own/host subsidaries in and from my city?
      </h1>
      <UtiltyBar
      />
      <FullPageMap />
    </>
  );
};

export default OutsideSubsidaries;
