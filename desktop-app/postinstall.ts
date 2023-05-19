import { replaceInFile } from 'replace-in-file';

async function performReplacements() {
  const replaceOptions = {
    files: 'node_modules/browser-sync-ui/lib/UI.js',
    from: /"network-throttle".*/,
    to: '',
  };

  const howlerOptions = {
    files: 'node_modules/use-sound/dist/types.d.ts',
    from: '/// <reference types="howler" />',
    to: 'import { Howl } from "howler";',
  };

  try {
    await replaceInFile(replaceOptions);
    console.log('Replacement in UI.js completed successfully.');

    await replaceInFile(howlerOptions);
    console.log('Replacement in types.d.ts completed successfully.');
  } catch (error) {
    console.error('Error occurred during replacements:', error);
  }
}

async function performPostInstall() {
  await performReplacements();
}

performPostInstall();
