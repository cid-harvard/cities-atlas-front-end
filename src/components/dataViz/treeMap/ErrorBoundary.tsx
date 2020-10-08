import React, { Component, ErrorInfo } from 'react';
import SimpleError from '../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <LoadingOverlay>
          <SimpleError fluentMessageId={'error-message-viz-failure'} />
        </LoadingOverlay>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
