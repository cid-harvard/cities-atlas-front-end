import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const Summary = () => {
  return (
    <DefaultContentWrapper>
      <h1>
        Quick facts and Summary
      </h1>
      <UtiltyBar
      />
    </DefaultContentWrapper>
  );
};

export default Summary;
