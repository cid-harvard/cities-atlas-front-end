import React from "react";
import useFluent from "../../../hooks/useFluent";

const AboutPilotUserGroup = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString("about-pilot-user-group-title")}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: getString("about-pilot-user-group-html"),
        }}
      />
    </>
  );
};

export default AboutPilotUserGroup;
