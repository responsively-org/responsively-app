import React, {useMemo, useState, useEffect} from 'react';
import {Rnd} from 'react-rnd';
import {useSelector, useDispatch} from 'react-redux';
import cx from 'classnames';
import pubsub from 'pubsub.js';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-github';

import useCommonStyles from '../useCommonStyles';
import useStyles from './useStyles';
import TextAreaWithCopyButton from '../../utils/TextAreaWithCopyButton';
import {Button} from '@material-ui/core';
import {APPLY_CSS} from '../../constants/pubsubEvents';

const LiveCssEditor = ({
  devToolsConfig,
  userPreferences,
  onUserPreferencesChange,
  onDevToolsModeChange,
}) => {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [css, setCss] = useState(null);

  const onApply = () => {
    if (!css) {
      return;
    }
    pubsub.publish(APPLY_CSS, [{css}]);
  };

  useEffect(onApply, [css]);

  return (
    <Rnd
      dragHandleClassName={classes.titleBar}
      style={{zIndex: 100}}
      default={{
        width: 400,
        height: 200,
        x: -200,
        y: 50,
      }}
    >
      <div className={classes.container}>
        <div className={classes.titleBar}>Live CSS Editor</div>
        <div className="">
          <AceEditor
            className={classes.editor}
            placeholder="Enter CSS to apply"
            mode="css"
            theme="monokai"
            name="blah2"
            onChange={setCss}
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            value={css}
            width="100%"
            height="auto"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />

          <Button onClick={onApply}>Apply</Button>
        </div>
      </div>
    </Rnd>
  );
};
export default LiveCssEditor;
