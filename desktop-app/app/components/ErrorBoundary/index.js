import React, {Fragment} from 'react';
import TextAreaWithCopyButton from '../../utils/TextAreaWithCopyButton';
import CreateIssue from '../CreateIssue';

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
      errorInfo: JSON.stringify(
        errorInfo,
        Object.getOwnPropertyNames(errorInfo)
      ),
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
            App has crashed!
          </h1>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <p style={{textAlign: 'center', margin: 120}}>
              Stack Trace: <TextAreaWithCopyButton text={this.state.error} />
            </p>
            <p style={{textAlign: 'center', margin: 120}}>
              Error Info: <TextAreaWithCopyButton text={this.state.errorInfo} />
            </p>
          </div>
          <CreateIssue state={this.state} />
        </Fragment>
      );
    }

    return this.props.children;
  }
}
