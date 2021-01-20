import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import FullPageMap from './FullPageMap';

const OutsideSubsidaries = () => {
  return (
    <>
      <h1>
        What cities are similar to my city?
      </h1>
      <UtiltyBar
      />
      <FullPageMap />
    </>
  );
};

export default OutsideSubsidaries;
