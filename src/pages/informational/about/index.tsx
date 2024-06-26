import React, { useRef } from "react";
import Content, {
  Section,
} from "../../../components/templates/informationalPage/Content";
import { AboutRoutes } from "../../../routing/routes";
import { useRouteMatch } from "react-router-dom";
import Helmet from "react-helmet";
import useFluent from "../../../hooks/useFluent";
import AboutWhatIs from "./AboutWhatIs";
import AboutTeam from "./AboutTeam";
import AboutPilotUserGroup from "./AboutPilotUserGroup";
import AboutResearch from "./AboutResearch";
import AboutGrowthLab from "./AboutGrowthLab";

const About = () => {
  const getString = useFluent();
  const sections: Section[] = [
    {
      label: getString("about-what-is-title"),
      route: AboutRoutes.AboutWhatIs,
      active: Boolean(useRouteMatch(AboutRoutes.AboutWhatIs)),
      Component: AboutWhatIs,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: getString("about-team-title"),
      route: AboutRoutes.AboutTeam,
      active: Boolean(useRouteMatch(AboutRoutes.AboutTeam)),
      Component: AboutTeam,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: getString("about-pilot-user-group-title"),
      route: AboutRoutes.AboutPilotUserGroup,
      active: Boolean(useRouteMatch(AboutRoutes.AboutPilotUserGroup)),
      Component: AboutPilotUserGroup,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: getString("about-research-title"),
      route: AboutRoutes.AboutResearch,
      active: Boolean(useRouteMatch(AboutRoutes.AboutResearch)),
      Component: AboutResearch,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: getString("about-growth-lab-title"),
      route: AboutRoutes.AboutGrowthLab,
      active: Boolean(useRouteMatch(AboutRoutes.AboutGrowthLab)),
      Component: AboutGrowthLab,
      ref: useRef<HTMLDivElement | null>(null),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {"About | " + getString("meta-data-title-default-suffix")}
        </title>
        <meta
          property="og:title"
          content={"About | " + getString("meta-data-title-default-suffix")}
        />
      </Helmet>
      <Content sections={sections} />
    </>
  );
};

export default About;
