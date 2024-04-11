import React from "react";
import useFluent from "../../../hooks/useFluent";

const AboutGrowthLab = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString("about-growth-lab-title")}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: getString("about-growth-lab-html") }}
      />
      {/*buffer needed in order to compensate for such a small amount of content*/}
      <div style={{ height: "25vh" }} />
    </>
  );
};

export default AboutGrowthLab;
