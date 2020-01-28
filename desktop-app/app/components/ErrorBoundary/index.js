import React, {Fragment} from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    alert(JSON.stringify({error, erroInfo}));
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Fragment>
          <h1>Something went wrong.</h1>
          <div>JSON.stringify(error)</div>
        </Fragment>
      );
    }

    return this.props.children;
  }
}
