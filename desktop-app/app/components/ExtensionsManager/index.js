import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import FolderOpenIcon from '@material-ui/icons/FolderOpenOutlined';
import ExtensionsIcon from '@material-ui/icons/Extension';
import InputAdornment from '@material-ui/core/InputAdornment';
import {remote, ipcRenderer} from 'electron';
import cx from 'classnames';
import {
  makeStyles,
  Popper,
  Fade,
  Paper,
  Typography,
  ClickAwayListener,
} from '@material-ui/core';
import {useTheme} from '@material-ui/core/styles';
import styles from './styles.css';
import useCommonStyles from '../useCommonStyles';
import helpScreenshot from './help-screenshot.png';

const useStyles = makeStyles({
  adornedEnd: {
    paddingRight: 0,
  },
});

export default function ExtensionsManager({triggerNavigationReload}) {
  const {BrowserWindow} = remote;
  const getInstalledExtensions = () =>
    Object.values(BrowserWindow.getDevToolsExtensions()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [extensionId, setExtensionId] = useState('');
  const [extensions, setExtensions] = useState(getInstalledExtensions());
  const commonClasses = useCommonStyles();
  const theme = useTheme();

  useEffect(() => {
    setErrorMessage('');
  }, [extensionId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    // validate the extension id.
    if (!validateExtensionId(extensionId)) {
      setErrorMessage('Please enter a valid extension ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await ipcRenderer.invoke('install-extension', extensionId);
      setExtensions(getInstalledExtensions());
      setExtensionId('');
      triggerNavigationReload();
    } catch {
      setErrorMessage('Error while installing the extension.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setExtensionId(e.target.value);
  };

  const handleDelete = name => {
    ipcRenderer.send('uninstall-extension', name);
    setExtensions(getInstalledExtensions());
  };

  const toggleHelp = event => {
    if (helpOpen) {
      if (event) {
        event.stopPropagation();
      }
      return setHelpOpen(!helpOpen);
    }
    if (!event.currentTarget.type) {
      return;
    }
    setAnchorEl(event.currentTarget);
    setHelpOpen(!helpOpen);
  };

  const getLocalExtensionPath = async event => {
    const localExtensionPath = await ipcRenderer.invoke(
      'get-local-extension-path'
    );

    setExtensionId(localExtensionPath);
  };

  const validateExtensionId = extensionId =>
    (extensionId.match(/^[a-z]+$/) && extensionId.length === 32) ||
    /[<>:"/\\|?]/.test(extensionId);

  return (
    <>
      <Popper open={helpOpen} anchorEl={anchorEl} placement="bottom" transition>
        {({TransitionProps}) => (
          <ClickAwayListener onClickAway={toggleHelp}>
            <Fade {...TransitionProps} timeout={350}>
              <Paper>
                <div className={styles.extensionsHelp}>
                  <p className={cx(styles.extensionsHelpText)}>
                    Find the extension on Chrome Web Store and copy the
                    extension ID from the address bar(as shown below).
                  </p>
                  <img
                    className={styles.extensionsHelpImg}
                    src={helpScreenshot}
                  />
                </div>
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
      <div className={commonClasses.sidebarContentSection}>
        <div className={commonClasses.sidebarContentSectionTitleBar}>
          <ExtensionsIcon className={styles.extensionManagerIcon} /> Manage
          Extensions
        </div>
        <div className={commonClasses.sidebarContentSectionContainer}>
          <form className={styles.extensionAdd} onSubmit={handleSubmit}>
            <div>
              <TextField
                type="text"
                color="secondary"
                value={extensionId}
                onChange={handleChange}
                disabled={loading}
                placeholder="Extension ID"
                variant="outlined"
                error={errorMessage !== ''}
                InputProps={{
                  classes: {
                    adornedEnd: classes.adornedEnd,
                  },
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={toggleHelp}
                        size="small"
                        title="Help"
                      >
                        <HelpOutlineIcon
                          fontSize="small"
                          htmlColor={theme.palette.lightIcon.main}
                        />
                      </IconButton>

                      <IconButton
                        onClick={getLocalExtensionPath}
                        size="small"
                        title="Install local devtools extension"
                      >
                        <FolderOpenIcon
                          fontSize="small"
                          htmlColor={theme.palette.lightIcon.main}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <Button onClick={handleSubmit} disabled={extensionId.trim() === ''}>
              {loading ? <CircularProgress size={22} /> : 'Add'}
            </Button>
          </form>

          {errorMessage && (
            <FormHelperText error>{errorMessage}</FormHelperText>
          )}

          <FormHelperText className={styles.extensionsNotice}>
            Note: Only DevTool extensions will work properly, other general
            browser extensions may not work as intended.
          </FormHelperText>

          <p className={styles.extensionsLabel}>
            Installed extensions ({extensions.length})
          </p>

          {extensions.map(extension => (
            <ExtensionItem
              extension={extension}
              key={extension.name}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ExtensionItem({extension, onDelete}) {
  const theme = useTheme();

  const handleDelete = () => {
    onDelete(extension.name);
  };

  return (
    <div className={styles.extension}>
      <div>
        <span className={styles.extensionName}>{extension.name}</span>
        <span className={styles.extensionVersion}>{extension.version}</span>
      </div>
      <IconButton onClick={handleDelete} size="small" title="Delete extension">
        <DeleteIcon fontSize="small" htmlColor={theme.palette.lightIcon.main} />
      </IconButton>
    </div>
  );
}
