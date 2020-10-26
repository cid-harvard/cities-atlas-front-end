import React from 'react';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';

const CompareSelf = () => {

  return (
    <DefaultContentWrapper>
      <h1>
        What cities should I compare myself to?
      </h1>
      <UtiltyBar
      />
    </DefaultContentWrapper>
  );
};

export default CompareSelf;
