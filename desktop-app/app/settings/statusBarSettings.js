import settings from 'electron-settings';
import {STATUS_BAR_VISIBILITY} from '../constants/settingKeys';

class StatusBarSettings {
  constructor() {
    const visibility = settings.get(STATUS_BAR_VISIBILITY);

    if (visibility === undefined) {
      settings.set(STATUS_BAR_VISIBILITY, true);
    }
  }

  getVisibility = () => settings.get(STATUS_BAR_VISIBILITY);

  setVisibility = visible => {
    settings.set(STATUS_BAR_VISIBILITY, visible);
  };
}

const statusBarSettingsInstance = new StatusBarSettings();

export {statusBarSettingsInstance as statusBarSettings};
