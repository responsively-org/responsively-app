import React from 'react';
import {getEnvironmentInfo} from '../../utils/generalUtils';
import Button from '@material-ui/core/Button';

const {openNewGitHubIssue} = require('electron-util');

const {
  appVersion,
  electronVersion,
  chromeVersion,
  nodeVersion,
  v8Version,
  osInfo,
} = getEnvironmentInfo();

const reportBody = state => `Hi I'm reporting an app crash:
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
${state.error}
</details>

<details>
<summary>Stack Trace</summary>
${state.errorInfo}
</details>`;

const createIssue = state => {
  openNewGitHubIssue({
    user: 'responsively-org',
    repo: 'responsively-app',
    body: reportBody(state),
    title: 'App crash report',
  });
};

export default function CreateIssue(props) {
  return (
    <div style={{textAlign: 'center'}}>
      <p>
        Please copy the contents in the above box and create an issue in the
        github repo
      </p>
      <Button onClick={() => createIssue(props.state)}>create issue</Button>
    </div>
  );
}
