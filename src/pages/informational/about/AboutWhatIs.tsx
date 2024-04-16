import React from "react";
import useFluent from "../../../hooks/useFluent";

const AboutWhatIs = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString("about-what-is-title")}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: getString("about-what-is-html") }}
      />
    </>
  );
};

export default AboutWhatIs;
