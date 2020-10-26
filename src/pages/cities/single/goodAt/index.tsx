import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const GoodAt = () => {
  return (
    <DefaultContentWrapper>
      <h1>
        What is my city good at?
      </h1>
      <UtiltyBar
      />
    </DefaultContentWrapper>
  );
};

export default GoodAt;
