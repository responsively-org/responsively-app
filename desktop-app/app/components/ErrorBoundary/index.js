import React, {Fragment} from 'react';
import TextBoxWithCopyButton from '../../utils/TextBoxWithCopyButton';

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
          <p style={{textAlign: 'center'}}>
            Stack Trace: <TextBoxWithCopyButton text={this.state.error} />
          </p>
          <p style={{textAlign: 'center'}}>
            Error Info: <TextBoxWithCopyButton text={this.state.errorInfo} />
          </p>
          <p style={{textAlign: 'center'}}>
            Please copy the contents in the above box and create an issue in the
            github repo:
            https://github.com/responsively-org/responsively-app/issues
          </p>
        </Fragment>
      );
    }

    return this.props.children;
  }
}
