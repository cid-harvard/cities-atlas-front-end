import React from 'react';
import Content, {Section} from '../../../components/templates/informationalPage/Content';
import {DataRoutes} from '../../../routing/routes';
import DataAbout from './DataAbout';
import DataCleaning from './DataCleaning';
import DataUpdates from './DataUpdates';
import DataClassifications from './DataClassifications';
import {useRouteMatch} from 'react-router-dom';

const Data = () => {
  const sections: Section[] = [
    {
      label: 'About the Data',
      route: DataRoutes.DataAbout,
      active: Boolean(useRouteMatch(DataRoutes.DataAbout)),
      Component: DataAbout,
    },
    {
      label: 'Data Cleaning',
      route: DataRoutes.DataCleaning,
      active: Boolean(useRouteMatch(DataRoutes.DataCleaning)),
      Component: DataCleaning,
    },
    {
      label: 'Data Updates',
      route: DataRoutes.DataUpdates,
      active: Boolean(useRouteMatch(DataRoutes.DataUpdates)),
      Component: DataUpdates,
    },
    {
      label: 'Data Classifications',
      route: DataRoutes.DataClassifications,
      active: Boolean(useRouteMatch(DataRoutes.DataClassifications)),
      Component: DataClassifications,
    },
  ];

  return (
    <Content
      sections={sections}
    />
  );
};

export default Data;
