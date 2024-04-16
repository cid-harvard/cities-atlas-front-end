import React from "react";
import { DefaultContentWrapper } from "../../../../styling/GlobalGrid";
import IndustrySpace from "./industrySpace";
import useCurrentCityId from "../../../../hooks/useCurrentCityId";
import SimpleError from "../../../../components/transitionStateComponents/SimpleError";
import { LoadingOverlay } from "../../../../components/transitionStateComponents/VizLoadingBlock";

const IndustrySpacePosition = () => {
  const cityId = useCurrentCityId();

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={"global-ui-error-invalid-city"} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  return (
    <DefaultContentWrapper>
      <IndustrySpace cityId={cityId} />
    </DefaultContentWrapper>
  );
};

export default IndustrySpacePosition;
