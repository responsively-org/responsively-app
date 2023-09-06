import React, {useEffect, useState, useRef} from 'react';
import cx from 'classnames';
import {motion} from 'framer-motion';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import CloseIcon from '@material-ui/icons/Close';
import ReplayIcon from '@material-ui/icons/Replay';
import {Tooltip} from '@material-ui/core';
import {ipcRenderer} from 'electron';
import {debounce} from 'lodash';
import {JSDOM} from 'jsdom';
import {makeStyles, useTheme} from '@material-ui/core/styles';

const {document} = new JSDOM('').window;
const queryCheck = s => document.createDocumentFragment().querySelector(s);
const INPUT_SOURCES = {TEXT_BOX: 'TEXT_BOX', OPTION_CLICK: 'OPTION_CLICK'};

const isSelectorValid = selector => {
  try {
    queryCheck(selector);
  } catch {
    return false;
  }
  return true;
};

const useStyles = makeStyles(theme => ({
  container: {
    height: 45,
    position: 'absolute',
    top: 50,
    right: 25,
    display: 'flex',
    backgroundColor: theme.palette.background.l2,
    borderRadius: 3,
    wordWrap: 'break-word',
    color: theme.palette.mode({light: '#000', dark: '#fff'}),
    boxShadow: `0 ${theme.palette.mode({
      light: '0px',
      dark: '3px',
    })} 5px rgba(0, 0, 0, 0.35)`,
    padding: 5,
    zIndex: theme.zIndex.tooltip,
  },
  textbox: {
    border: 'none',
    outline: 'none',
    borderColor: 'transparent',
    width: 250,
    height: '100%',
    background: 'none',
    color: theme.palette.mode({light: '#000', dark: '#fff'}),
    fontFamily: "'Consolas', 'Courier New', monospace",
    whiteSpace: 'pre',
  },
  iconsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  separator: {
    borderLeft: '1px solid #636363',
    margin: 3,
  },
  icon: {
    cursor: 'pointer',
    width: 30,
    padding: 5,
    color: theme.palette.mode({light: '#636363', dark: '#fffc'}),
    '&:hover': {
      '& svg': {
        backgroundColor: theme.palette.primary.light,
        color: '#fff',
      },
    },
  },
  btn: {
    margin: 1,
    cursor: 'pointer',
    color: theme.palette.mode({light: '#636363', dark: '#fffc'}),
    '&:hover': {
      '& div': {
        backgroundColor: theme.palette.primary.light,
        color: '#fff',
      },
    },

    '& div': {
      padding: 5,
      fontFamily: "'Consolas', 'Courier New', monospace",
      fontSize: 12,
    },
  },
  btnActive: {
    borderRadius: 2,
    '& div': {
      backgroundColor: theme.palette.primary.light,
      color: '#fff',
    },
  },
}));

const PageNavigator = props => {
  const [selector, setSelector] = useState(props.selector || '');
  const [inputSource, setInputSource] = useState(null);
  const inputRef = React.createRef();
  const styles = useStyles();

  useEffect(() => {
    if (props.active === true) {
      document.addEventListener('keydown', _handleKeyDown);
      inputRef.current.focus();
    } else if (props.active === false) {
      document.removeEventListener('keydown', _handleKeyDown);
    }
    return () => document.removeEventListener('keydown', _handleKeyDown);
  }, [props.active, inputRef.current]);

  useEffect(() => {
    if (inputSource === INPUT_SOURCES.OPTION_CLICK) {
      _navigateNext();
    }
  }, [selector, inputSource]);

  const _handleChange = e => {
    setSelector(e.target.value);
    if (inputSource !== INPUT_SOURCES.TEXT_BOX) {
      setInputSource(INPUT_SOURCES.TEXT_BOX);
    }
  };

  const handleOptionClick = val => {
    setSelector(val);
    setInputSource(INPUT_SOURCES.OPTION_CLICK);
  };

  const _navigateNext = debounce(() => {
    if (!isSelectorValid(selector)) props.resetPageNavigator();
    else props.navigateToNextSelector(selector);
  }, 25);

  const _navigatePrev = debounce(() => {
    if (!isSelectorValid(selector)) props.resetPageNavigator();
    else props.navigateToPrevSelector(selector);
  }, 25);

  const resetPageNavigator = () => {
    setSelector('');
    props.resetPageNavigator();
  };

  const _closePageNavigator = () => {
    props.onChangePageNavigatorActive(false);
  };

  const _handleInputKeyDown = e => {
    if (e.shiftKey && e.key === 'Enter') {
      _navigatePrev();
    } else if (e.key === 'Enter') {
      _navigateNext();
    } else if (e.key === 'Escape') {
      _closePageNavigator();
    }
  };

  const _handleKeyDown = e => {
    if (e.key === 'Escape') {
      _closePageNavigator();
    }
  };

  if (!props.active) {
    return null;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{y: props.active ? -70 : 0, scale: 1}}
      animate={{y: props.active ? 0 : -70, scale: 1}}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0,
      }}
    >
      <div className={styles.iconsContainer}>
        <span
          className={cx(styles.btn, {
            [styles.btnActive]: selector === 'section',
          })}
          onClick={() => handleOptionClick('section')}
        >
          <div>section</div>
        </span>
        <span
          className={cx(styles.btn, {[styles.btnActive]: selector === 'h1'})}
          onClick={() => {
            handleOptionClick('h1');
          }}
        >
          <div>h1</div>
        </span>
        <span
          className={cx(styles.btn, {[styles.btnActive]: selector === 'h2'})}
          onClick={() => handleOptionClick('h2')}
        >
          <div>h2</div>
        </span>
        <span
          className={cx(styles.btn, {[styles.btnActive]: selector === 'h3'})}
          onClick={() => handleOptionClick('h3')}
        >
          <div>h3</div>
        </span>
      </div>
      <div className={styles.separator} />
      <div className={styles.textboxContainer}>
        <input
          ref={inputRef}
          className={styles.textbox}
          type="text"
          value={selector || ''}
          onChange={_handleChange}
          onKeyDown={_handleInputKeyDown}
          placeholder="css selector"
        />
      </div>
      <div className={styles.separator} />
      <div className={styles.iconsContainer}>
        <span className={styles.icon} onClick={_navigatePrev}>
          <UpIcon />
        </span>
        <span className={styles.icon} onClick={_navigateNext}>
          <DownIcon />
        </span>
        <span className={styles.icon} onClick={resetPageNavigator}>
          <ReplayIcon style={{height: 25, width: 25, padding: 3}} />
        </span>
        <span className={styles.icon} onClick={_closePageNavigator}>
          <CloseIcon style={{height: 25, width: 25, padding: 3}} />
        </span>
      </div>
    </motion.div>
  );
};

export default PageNavigator;
