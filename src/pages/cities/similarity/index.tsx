import React from "react";
import InformationalPage from "../../../components/templates/informationalPage";
import SimilarCities from "./similarCities";

const SimilarCity = () => {
  return (
    <InformationalPage contentFull={true}>
      <SimilarCities />
    </InformationalPage>
  );
};

export default SimilarCity;
