import path from 'path';
import fs from 'fs';
import { session, app } from 'electron';

export const loadVueDevTools = async (): Promise<void> => {
  const extensionPath = path.resolve(app.getAppPath(), '..', 'extensions', 'vue-devtools');
  if (!fs.existsSync(extensionPath)) {
    console.warn(`[extensions] Vue DevTools not found at ${extensionPath}`);
    return;
  }
  try {
    await session.defaultSession.loadExtension(extensionPath, { allowFileAccess: true });
    console.log(`[extensions] Vue DevTools loaded from ${extensionPath}`);
  } catch (err) {
    console.error(`[extensions] Failed to load Vue DevTools from ${extensionPath}`, err);
  }
};
