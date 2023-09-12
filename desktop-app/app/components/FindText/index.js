import React, {useEffect, useState, useRef} from 'react';
import cx from 'classnames';
import {motion} from 'framer-motion';
import styles from './styles.module.css';
import {Icon} from 'flwww';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import CloseIcon from '@material-ui/icons/Close';
import {Tooltip} from '@material-ui/core';
import {ipcRenderer} from 'electron';
import {debounce} from 'lodash';

const FindText = props => {
  useEffect(() => {
    ipcRenderer.on('find-text', _enable);
    return () => {
      ipcRenderer.removeListener('find-text', _enable);
    };
  }, []);
  const [textToFind, setTextToFind] = useState(null);

  const inputRef = React.createRef();
  const [findTextEnabled, setFindTextEnabled] = useState(null);

  useEffect(() => {
    if (findTextEnabled === true) {
      document.addEventListener('keydown', _handleKeyDown);
      inputRef.current.focus();
    } else if (findTextEnabled === false) {
      document.removeEventListener('keydown', _handleKeyDown);
    }
    return () => document.removeEventListener('keydown', _handleKeyDown);
  }, [findTextEnabled, inputRef.current]);

  const _enable = () => {
    setFindTextEnabled(true);
  };

  const _handleChange = e => {
    setTextToFind(e.target.value);
  };

  useEffect(() => {
    if (textToFind) {
      _find(textToFind);
    } else {
      _stopFind();
    }
  }, [textToFind]);

  const _find = debounce(text => {
    const findOptions = {
      textToFind: text,
    };
    props.findText(findOptions);
  }, 25);

  const _findNext = debounce(() => {
    const findOptions = {
      textToFind,
      options: {
        findNext: true,
      },
    };
    props.findText(findOptions);
  }, 25);

  const _findPrevious = debounce(() => {
    const findOptions = {
      textToFind,
      options: {
        forward: false,
        findNext: true,
      },
    };
    props.findText(findOptions);
  }, 25);

  const _stopFind = () => {
    const findOptions = {
      stop: true,
    };
    props.findText(findOptions);
  };

  const _closeFind = () => {
    _stopFind();
    setFindTextEnabled(false);
  };

  const _handleInputKeyDown = e => {
    if (e.shiftKey && e.key === 'Enter') {
      _findPrevious();
    } else if (e.key === 'Enter') {
      _findNext();
    }
  };

  const _handleKeyDown = e => {
    if (e.key === 'Escape') {
      _closeFind();
    }
  };

  if (findTextEnabled === null) {
    return null;
  }
  return (
    <motion.div
      className={styles.container}
      initial={{y: findTextEnabled ? -70 : 0, scale: 1}}
      animate={{y: findTextEnabled ? 0 : -70, scale: 1}}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0,
      }}
    >
      <div className={styles.textboxContainer}>
        <input
          ref={inputRef}
          className={styles.textbox}
          type="text"
          value={textToFind || ''}
          onChange={_handleChange}
          onKeyDown={_handleInputKeyDown}
        />
      </div>
      <div className={styles.separator} />
      <div className={styles.iconsContainer}>
        <span className={styles.icon} onClick={_findPrevious}>
          <UpIcon />
        </span>
        <span className={styles.icon} onClick={_findNext}>
          <DownIcon />
        </span>
        <span className={styles.icon} onClick={_closeFind}>
          <CloseIcon className={styles.closeIcon} />
        </span>
      </div>
    </motion.div>
  );
};

export default FindText;
