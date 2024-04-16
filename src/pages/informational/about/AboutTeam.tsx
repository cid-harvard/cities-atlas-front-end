import React from "react";
import useFluent from "../../../hooks/useFluent";
import styled from "styled-components/macro";
import { baseColor } from "../../../styling/styleUtils";

const Content = styled.div`
  .team-member-name {
    color: ${baseColor};
  }
`;

const AboutTeam = () => {
  const getString = useFluent();
  return (
    <>
      <h1>{getString("about-team-title")}</h1>
      <Content
        dangerouslySetInnerHTML={{ __html: getString("about-team-html") }}
      />
    </>
  );
};

export default AboutTeam;
