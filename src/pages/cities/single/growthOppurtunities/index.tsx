import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const IndustryMove = () => {
  return (
    <DefaultContentWrapper>
      <h1>
        What industries can my city move to?
      </h1>
      <UtiltyBar
      />
    </DefaultContentWrapper>
  );
};

export default IndustryMove;
