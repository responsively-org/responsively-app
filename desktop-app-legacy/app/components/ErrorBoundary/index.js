import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextAreaWithCopyButton from '../../utils/TextAreaWithCopyButton';
import CreateIssue from '../CreateIssue';
import Logo from '../icons/Logo';

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
          <h1 className={classes.title}>
            <Logo height={60} />
            <br />
            😓 Something went wrong!
          </h1>
          <div className={classes.errorsContainer}>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.errorContainer}
            >
              Stack Trace: <TextAreaWithCopyButton text={this.state.error} />
            </Typography>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.errorContainer}
            >
              Error Info: <TextAreaWithCopyButton text={this.state.errorInfo} />
            </Typography>
          </div>
          <CreateIssue state={this.state} />
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = theme => ({
  errorBoundaryContainer: {
    background: theme.palette.background.default,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    '& h1': {
      textAlign: 'center',
    },
  },
  title: {
    color: theme.palette.text.primary,
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
});

export default withStyles(styles)(ErrorBoundary);
