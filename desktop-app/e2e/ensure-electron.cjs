const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const electronRoot = path.join(projectRoot, 'node_modules', 'electron');
const electronInstallScript = path.join(electronRoot, 'install.js');
const electronPathFile = path.join(electronRoot, 'path.txt');

const getPlatformPath = () => {
  const platform = process.env.npm_config_platform || process.platform;

  switch (platform) {
    case 'mas':
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron';
    case 'freebsd':
    case 'openbsd':
    case 'linux':
      return 'electron';
    case 'win32':
      return 'electron.exe';
    default:
      throw new Error(`Electron builds are not available on platform: ${platform}`);
  }
};

const expectedPlatformPath = getPlatformPath();
const expectedElectronPath = path.join(electronRoot, 'dist', expectedPlatformPath);

const writeElectronPathFile = () => {
  fs.writeFileSync(electronPathFile, expectedPlatformPath);
};

const resolveElectronPath = () => {
  const electronIndex = require.resolve('electron/index.js');
  delete require.cache[electronIndex];
  return require('electron/index.js');
};

const installElectron = () => {
  const env = {...process.env};
  delete env.ELECTRON_SKIP_BINARY_DOWNLOAD;
  delete env.npm_config_electron_skip_binary_download;

  fs.rmSync(path.join(electronRoot, 'dist'), {recursive: true, force: true});

  childProcess.execFileSync(process.execPath, [electronInstallScript], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
};

let electronPath;

try {
  electronPath = resolveElectronPath();
} catch {
  if (fs.existsSync(expectedElectronPath)) {
    writeElectronPathFile();
  } else {
    installElectron();
  }
  electronPath = resolveElectronPath();
}

if (!fs.existsSync(electronPath)) {
  if (fs.existsSync(expectedElectronPath)) {
    writeElectronPathFile();
  } else {
    installElectron();
  }
  electronPath = resolveElectronPath();
}

if (!fs.existsSync(electronPath)) {
  throw new Error(`Electron executable was not found at ${electronPath}`);
}

console.log(`Electron executable: ${electronPath}`);
