import { GetString } from 'fluent-react/compat';
import { useContext } from 'react';
import {
  AppLocalizationAndBundleContext,
} from '../contextProviders/getFluentLocalizationContext';

export default () => {
  const {localization} = useContext(AppLocalizationAndBundleContext);
  const getFluentString: GetString = (...args) => localization.getString(...args);
  return getFluentString;
};
