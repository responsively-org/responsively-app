import { useState, useEffect } from 'react';
import { gt } from 'semver';

const fetchAssets = async () => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/responsively-org/responsively-app-releases/releases/latest'
    );
    const data = await response.json();
    return data.tag_name;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting assets', err);
    return '';
  }
};

const getAppVersion = async () => {
  try {
    const version = await window.electron.ipcRenderer.invoke('get-app-version');
    return `v${version}`;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting app version', err);
    return '';
  }
};

const useCheckVersion = () => {
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState<
    null | boolean
  >(null);
  const [latestVersion, setLatestVersion] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    const checkVersion = async () => {
      const currentVersionResult = await getAppVersion();
      const latestVersionResult = await fetchAssets();

      setCurrentVersion(currentVersionResult);
      setLatestVersion(latestVersionResult);

      const isNewVersion =
        currentVersionResult &&
        latestVersionResult &&
        gt(latestVersionResult, currentVersionResult);

      setIsNewVersionAvailable(isNewVersion);
    };

    if (isNewVersionAvailable === null) {
      checkVersion();
    }
  }, [currentVersion, isNewVersionAvailable, latestVersion]);

  return {
    isNewVersionAvailable,
    currentVersion,
    latestVersion,
  };
};

export default useCheckVersion;
