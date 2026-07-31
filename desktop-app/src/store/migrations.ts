/* eslint-disable @typescript-eslint/no-explicit-any -- migrations operate on historical untyped shapes */
import Store from 'electron-store';
import {randomUUID} from 'crypto';

import {PreviewSuites} from '../renderer/store/features/device-manager';

import {defaultDevices, Device} from '../common/deviceList';

const defaultActiveDevices = ['10008', '10013', '10015'];

export const migrations = {
  '1.2.0': (store: Store) => {
    try {
      console.log('Migrating for 1.2.0', store.get('deviceManager'));

      // Migrate custom devices
      const previousCustomDevices: Device[] = store.get('deviceManager.customDevices') as Device[];
      const newCustomDevices: Device[] = previousCustomDevices.map((device) => {
        const newDevice = {
          ...device,
          id: randomUUID(),
        };
        return newDevice;
      });
      store.set('deviceManager.customDevices', newCustomDevices);

      // Migrate active devices to suites
      const previousActiveDevices: string[] = store.get('deviceManager.activeDevices') as string[];

      const newActiveDevices: string[] = previousActiveDevices
        .map((name) => {
          return defaultDevices.find((device) => device.name === name)?.id;
        })
        .filter(Boolean) as string[];

      if (
        newActiveDevices.length === 3 &&
        newActiveDevices.every((id) => defaultActiveDevices.includes(id))
      ) {
        // default devices so no need to migrate
        console.log('No need to migrate');
        return;
      }

      store.set('deviceManager.previewSuites', [
        {
          id: 'default',
          name: 'Default',
          devices: newActiveDevices.length > 0 ? newActiveDevices : defaultActiveDevices,
        },
      ]);
    } catch (e) {
      console.log('Migration failed', e);
      store.set('deviceManager.previewSuites', [
        {
          id: 'default',
          name: 'Default',
          devices: defaultActiveDevices,
        },
      ]);
      return;
    }

    console.log('Migration successful', store.get('deviceManager'));
  },
  '1.2.1': (store: Store) => {
    const suites = store.get('deviceManager.previewSuites') as PreviewSuites | undefined;
    if (suites == null || suites.length > 0) {
      return;
    }
    store.set('deviceManager.previewSuites', [
      {
        id: 'default',
        name: 'Default',
        devices: defaultActiveDevices,
      },
    ]);
  },
  '1.14.0': (store: Store) => {
    // Migrate dpi to dpr in custom devices
    try {
      const previousCustomDevices: any[] = store.get('deviceManager.customDevices') as any[];
      const newCustomDevices: Device[] = previousCustomDevices.map((device) => {
        const newDevice = {
          ...device,
          dpr: device.dpi !== undefined ? device.dpi : device.dpr,
        };
        delete newDevice.dpi;
        return newDevice as Device;
      });
      store.set('deviceManager.customDevices', newCustomDevices);
      console.log('Migration for 1.14.0 successful', store.get('deviceManager.customDevices'));
    } catch (e) {
      console.log('Migration for 1.14.0 failed', e);
    }
  },
  '1.18.1': (store: Store) => {
    const legacyPreviewLayout = store.get('ui.previewlayout');
    const previewLayout = store.get('ui.previewLayout');

    if (previewLayout == null && legacyPreviewLayout != null) {
      store.set('ui.previewLayout', legacyPreviewLayout);
    }

    if (legacyPreviewLayout != null) {
      store.delete('ui.previewlayout');
    }
  },
  '2.0.0': (store: Store) => {
    // The Windows "Menus in Titlebar" option and its custom-electron-titlebar
    // implementation are gone; drop the orphaned preference so it stops
    // sitting in config.json for anyone who toggled it.
    if (store.get('userPreferences.customTitlebar') !== undefined) {
      store.delete('userPreferences.customTitlebar');
    }
    // 2.0 opens on the redesign's default layout (Grid/FLEX) once; the choice
    // persists again from the next layout switch.
    if (store.get('ui.previewLayout') !== undefined) {
      store.delete('ui.previewLayout');
    }
    // The weekly sponsorship modal became the monthly support card; carry the
    // last-shown timestamp over so upgraders aren't prompted immediately.
    const sponsorshipLastShown = store.get('sponsorship.lastShown');
    if (sponsorshipLastShown !== undefined) {
      store.set('ui.announcements.supportShownAt', sponsorshipLastShown);
      store.delete('sponsorship');
    }
    // The GitHub-release-notes modal is superseded by the launch card and the
    // bell panel's release highlights.
    if (store.get('seenReleaseNotes') !== undefined) {
      store.delete('seenReleaseNotes');
    }
  },
};
