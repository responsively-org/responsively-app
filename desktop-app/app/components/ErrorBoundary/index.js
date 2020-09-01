import React from 'react';
import TextAreaWithCopyButton from '../../utils/TextAreaWithCopyButton';
import CreateIssue from '../CreateIssue';
import {withStyles} from '@material-ui/core/styles';
import Logo from '../icons/Logo';

const styles = {
  errorBoundaryContainer: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    '& h1': {
      textAlign: 'center',
    },
  },
  errorsContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  errorContainer: {
    textAlign: 'center',
    justifyContent: 'center',
    margin: '3rem 6rem',
    width: '30vw',
  },
};

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
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
    const {classes} = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className={classes.errorBoundaryContainer}>
          <h1>
            <Logo height={60} />
            <br />
            😓 Something went wrong!
          </h1>
          <div className={classes.errorsContainer}>
            <p className={classes.errorContainer}>
              Stack Trace: <TextAreaWithCopyButton text={this.state.error} />
            </p>
            <p className={classes.errorContainer}>
              Error Info: <TextAreaWithCopyButton text={this.state.errorInfo} />
            </p>
          </div>
          <CreateIssue state={this.state} />
        </div>
      );
    }

    return this.props.children;
  }
}

export default withStyles(styles)(ErrorBoundary);
