import React from 'react';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
import {getEnvironmentInfo} from '../../utils/generalUtils';

const {openNewGitHubIssue} = require('electron-util');

const reportBody = state => {
  const {
    appVersion,
    electronVersion,
    chromeVersion,
    nodeVersion,
    v8Version,
    osInfo,
  } = getEnvironmentInfo();
  return `Hi I'm reporting an app crash:
**PLEASE WRITE HERE ANY HINT THAT HELP US TO REPRODUCE THIS**

<details>
<summary>Environment</summary>

- Version: ${appVersion}
- Electron: ${electronVersion}
- Chrome: ${chromeVersion}
- Node.js: ${nodeVersion}
- V8: ${v8Version}
- OS: ${osInfo}
</details>

<details>
<summary>Error Info</summary>

\`\`\`json
${(state.error || '').split('\\n ').join('\n')}
\`\`\`
</details>

<details>
<summary>Stack Trace</summary>

\`\`\`json
${(state.errorInfo || '').split('\\n ').join('\n')}
\`\`\`
</details>

Hope you find the issue, regards`;
};

const createIssue = state => {
  openNewGitHubIssue({
    user: 'responsively-org',
    repo: 'responsively-app',
    body: reportBody(state),
    title: 'App crash report',
  });
};

function CreateIssue(props) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p>
        Please click on the below link to automatically create an issue on
        GitHub.
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={() => createIssue(props.state)}
      >
        Create issue
      </Button>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  container: {
    textAlign: 'center',
    color: theme.palette.text.primary,
  },
}));

export default CreateIssue;
