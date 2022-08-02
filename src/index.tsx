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
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if(process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_SENTRY_ENV) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    environment: process.env.REACT_APP_SENTRY_ENV,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.8,
  });

} else {
  console.log('Build is running without Sentry.');
}



const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache(),
});

ReactDOM.render((
  <ApolloProvider client={client}>
    <FluentText.Provider value={fluentValue}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FluentText.Provider>
  </ApolloProvider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
