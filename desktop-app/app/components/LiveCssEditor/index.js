import React, {useMemo, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import cx from 'classnames';
import pubsub from 'pubsub.js';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';

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
  const [css, setCss] = useState(`body {
    background-color: black;
  }`);

  const onApply = () => {
    pubsub.publish(APPLY_CSS, [{css}]);
  };

  useEffect(onApply, [css]);

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <SettingsIcon width={26} margin={2} /> Live CSS Editor
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={4}
          variant="outlined"
          placeholder="CSS to apply"
          defaultValue={css}
          onChange={e => {
            setCss(e.target.value);
          }}
        />
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
};
export default LiveCssEditor;
