import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {
  appLocalizationAndBundle as fluentValue,
  AppLocalizationAndBundleContext as FluentText,
} from './contextProviders/getFluentLocalizationContext';
import {
  BrowserRouter,
} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

ReactDOM.render((
  <FluentText.Provider value={fluentValue}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </FluentText.Provider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
