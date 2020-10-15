export const APP_UPDATER_STATUS = {
  Idle: {id: 'Idle', title: 'Check for Updates...', enabled: true},
  Checking: {id: 'Checking', title: 'Checking for Updates...', enabled: false},
  NoUpdate: {id: 'NoUpdate', title: 'The App is up to date!', enabled: false},
  NewVersion: {
    id: 'NewVersion',
    title: 'Downloading Update...',
    enabled: false,
  },
  Downloading: {
    id: 'Downloading',
    title: 'New version available!',
    enabled: false,
  },
  Downloaded: {id: 'Downloaded', title: 'Update Downloaded', enabled: false},
};
