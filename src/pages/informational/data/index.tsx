import React, {useRef} from 'react';
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
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: 'Data Cleaning',
      route: DataRoutes.DataCleaning,
      active: Boolean(useRouteMatch(DataRoutes.DataCleaning)),
      Component: DataCleaning,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: 'Data Updates',
      route: DataRoutes.DataUpdates,
      active: Boolean(useRouteMatch(DataRoutes.DataUpdates)),
      Component: DataUpdates,
      ref: useRef<HTMLDivElement | null>(null),
    },
    {
      label: 'Data Classifications',
      route: DataRoutes.DataClassifications,
      active: Boolean(useRouteMatch(DataRoutes.DataClassifications)),
      Component: DataClassifications,
      ref: useRef<HTMLDivElement | null>(null),
    },
  ];

  return (
    <Content
      sections={sections}
    />
  );
};

export default Data;
