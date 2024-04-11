import React from "react";
import { Route, Switch } from "react-router-dom";
import { Routes } from "../../routing/routes";
import InformationalPage from "../../components/templates/informationalPage";
import About from "./about";
import Contact from "./contact";
import Faq from "./faq";

const City = () => {
  return (
    <InformationalPage>
      <Switch>
        <Route path={Routes.AboutBase} component={About} />
        <Route path={Routes.ContactBase} component={Contact} />
        <Route path={Routes.FaqBase} component={Faq} />
      </Switch>
    </InformationalPage>
  );
};

export default City;
