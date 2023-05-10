import { replaceInFile } from 'replace-in-file';
import { execSync } from 'child_process';

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

function runCheckNativeDepScript() {
  try {
    execSync('ts-node .erb/scripts/check-native-dep.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error occurred during check-native-dep script:', error);
  }
}

function installAppDeps() {
  try {
    execSync('electron-builder install-app-deps', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error occurred during install-app-deps:', error);
  }
}

function runWebpack() {
  try {
    execSync(
      'cross-env NODE_ENV=development TS_NODE_TRANSPILE_ONLY=true webpack --config ./.erb/configs/webpack.config.renderer.dev.dll.ts',
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.error('Error occurred during webpack:', error);
  }
}

async function performPostInstall() {
  await performReplacements();
  runCheckNativeDepScript();
  installAppDeps();
  runWebpack();
}

performPostInstall();
