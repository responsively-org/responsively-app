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
import Button from '@material-ui/core/Button';
import {APPLY_CSS} from '../../constants/pubsubEvents';
import {
  CSS_EDITOR_MODES,
  isHorizontallyStacked,
  isVeriticallyStacked,
} from '../../constants/previewerLayouts';

const LiveCssEditor = ({isOpen, position, content, boundaryClass}) => {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const [css, setCss] = useState(null);
  const [height, setHeight] = useState(
    isVeriticallyStacked(position) ? '100%' : 200
  );
  const [width, setWidth] = useState(
    isHorizontallyStacked(position) ? '100%' : 400
  );

  const onApply = () => {
    if (!css) {
      return;
    }
    pubsub.publish(APPLY_CSS, [{css}]);
  };

  useEffect(onApply, [css]);

  return (
    <div className={classes.wrapper} style={{height, width}}>
      <Rnd
        dragHandleClassName={classes.titleBar}
        disableDragging={position !== CSS_EDITOR_MODES.UNDOCKED}
        style={{zIndex: 100}}
        default={{
          width: isHorizontallyStacked(position) ? '100%' : 400,
          height: isVeriticallyStacked(position) ? '100%' : 200,
          x: 0,
          y: 0,
        }}
        bounds={`.${boundaryClass}`}
        onResize={(e, dir, ref) => {
          const {width: _width, height: _height} = ref.getBoundingClientRect();
          if (width !== _width) {
            setWidth(_width);
          }
          if (height !== _height) {
            setHeight(_height);
          }
        }}
      >
        <div className={classes.container}>
          <div className={classes.titleBar}>Live CSS Editor</div>
          <div className="">
            <AceEditor
              className={classes.editor}
              placeholder="Enter CSS to apply"
              mode="css"
              theme="twilight"
              name="css"
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

            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </Rnd>
    </div>
  );
};
export default LiveCssEditor;
