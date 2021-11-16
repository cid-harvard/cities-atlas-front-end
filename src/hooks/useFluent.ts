import { GetString } from 'fluent-react/compat';
import { useContext } from 'react';
import {
  AppLocalizationAndBundleContext,
} from '../contextProviders/getFluentLocalizationContext';

export const possessive = ([word]: [string]): string => {
  const lastCharacter = word[word.length - 1];
  if (lastCharacter === 's') {
    return word + "'";
  } else {
    return word + "'s";
  }
};

export const plural = (word: string): string => {
  const lastCharacter = word[word.length - 1];
  if (lastCharacter === 's') {
    return word + '';
  } else {
    return word + 's';
  }
};

// Taken from https://stackoverflow.com/a/13627586
const ordinalSuffix = ([input]: [number]): string => {
  const j = input % 10, k = input % 100;
  if (j === 1 && k !== 11) {
      return 'st';
  }
  if (j === 2 && k !== 12) {
      return 'nd';
  }
  if (j === 3 && k !== 13) {
      return 'rd';
  }
  return 'th';
};

export const ordinalNumber = ([input]: [number]) => input + ordinalSuffix([input]);

export default () => {
  const {localization} = useContext(AppLocalizationAndBundleContext);
  const getFluentString: GetString = (...args) => localization.getString(...args);
  return getFluentString;
};
