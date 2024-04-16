import React from "react";
import TopRCA from "./TopRCA";
import useCurrentCityId from "../../../../../../hooks/useCurrentCityId";
import TopCities from "./TopCities";

const BottomRow = () => {
  const cityId = useCurrentCityId();

  if (!cityId) {
    return null;
  }

  return (
    <>
      <TopRCA cityId={cityId} />
      <TopCities />
    </>
  );
};

export default BottomRow;
