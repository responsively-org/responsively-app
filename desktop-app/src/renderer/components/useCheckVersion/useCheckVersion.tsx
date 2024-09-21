import { useState, useEffect } from 'react';
import { gt } from 'semver';
import useLocalStorage from '../useLocalStorage/useLocalStorage';

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
  const [latestVersion, setLatestVersion] = useLocalStorage<undefined | string>(
    'latestVersion'
  );
  const [currentVersion, setCurrentVersion] = useState('');
  const [lastCheck, setLastCheck] = useLocalStorage<number | undefined>(
    'lastCheck'
  );
  const biWeeklyCheckInMs = 1209600000;

  useEffect(() => {
    const checkVersion = async () => {
      const currentVersionResult = await getAppVersion();

      setCurrentVersion(currentVersionResult);

      const now = Date.now();
      if (!latestVersion || !lastCheck || now - lastCheck > biWeeklyCheckInMs) {
        const latestVersionResult = await fetchAssets();
        if (latestVersionResult) {
          setLatestVersion(latestVersionResult);
          setLastCheck(now);
        }
      }
      const isNewVersion =
        currentVersionResult &&
        latestVersion &&
        gt(latestVersion, currentVersionResult);

      setIsNewVersionAvailable(Boolean(isNewVersion));
    };

    if (isNewVersionAvailable === null) {
      checkVersion();
    }
  }, [
    isNewVersionAvailable,
    lastCheck,
    latestVersion,
    setLastCheck,
    setLatestVersion,
  ]);

  return {
    isNewVersionAvailable,
    currentVersion,
    latestVersion,
  };
};

export default useCheckVersion;
