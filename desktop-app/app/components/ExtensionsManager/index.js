import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import ExtensionsIcon from '@material-ui/icons/Extension';
import {remote, ipcRenderer} from 'electron';
import cx from 'classnames';
import styles from './styles.css';
import commonStyles from '../common.styles.css';
import { lightIconsColor } from '../../constants/colors';


export default function ExtensionsManager({triggerNavigationReload}) {
  const {BrowserWindow} = remote;
  const getInstalledExtensions = () => {
    return Object.values(BrowserWindow.getDevToolsExtensions()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [extensionId, setExtensionId] = useState('');
  const [extensions, setExtensions] = useState(getInstalledExtensions());

  useEffect(() => {
    setErrorMessage('');
  }, [extensionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const id = extensionId.replace(/\/$/, '').split('/').pop();

    try {
      await ipcRenderer.invoke('install-extension', id);
      setExtensions(getInstalledExtensions());
      setExtensionId('');
      triggerNavigationReload();
    } catch (e) {
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

  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <ExtensionsIcon className={styles.extensionManagerIcon} />  Manage Extensions
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>

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
            />
          </div>
          <Button onClick={handleSubmit} disabled={extensionId.trim() === ''}>
            {loading ? <CircularProgress size={22}/> : 'Add'}
          </Button>
        </form>

        {errorMessage && <FormHelperText error={true}>{errorMessage}</FormHelperText>}

        <FormHelperText className={styles.extensionsNotice}>Note: Only DevTool extensions will work properly, other general browser extensions may not work as intended.</FormHelperText>

        <p className={styles.extensionsLabel}>Installed extensions ({extensions.length})</p>

        {extensions.map(extension => (
          <ExtensionItem
            extension={extension}
            key={extension.name}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

function ExtensionItem({ extension, onDelete }) {
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
        <DeleteIcon fontSize="small" htmlColor={lightIconsColor}/>
      </IconButton>
    </div>
  );
}
