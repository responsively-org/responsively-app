import React, {Fragment} from 'react';

export default class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      err: error,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      errorInfo,
    });
  }

  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Fragment>
          <h1 style={{textAlign: 'center', marginTop: 100}}>
            Something went wrong.
          </h1>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <pre
              style={{overflow: 'scroll', background: '#6d6d6d', width: '80%'}}
            >
              {JSON.stringify(this.state, null, 2)}
            </pre>
          </div>
          <p style={{width: '80%', textAlign: 'center'}}>
            Please copy the contents in the above box and create an issue in the
            github repo: https://github.com/manojVivek/responsively-app/issues
          </p>
        </Fragment>
      );
    }

    return this.props.children;
  }
}
