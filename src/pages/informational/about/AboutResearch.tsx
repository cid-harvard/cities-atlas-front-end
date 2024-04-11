import React from "react";
import useFluent from "../../../hooks/useFluent";

const AboutResearch = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString("about-research-title")}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: getString("about-research-html") }}
      />
    </>
  );
};

export default AboutResearch;
