import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {resolveBridgeEntry, userDataDir} = require('../lib/resolve.js');

const makeTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'responsively-mcp-test-'));

const touch = (file) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, '');
  return file;
};

test('RESPONSIVELY_MCP_BRIDGE wins when it exists', () => {
  const tmp = makeTmp();
  const bridge = touch(path.join(tmp, 'custom', 'cli.js'));
  const entry = resolveBridgeEntry({RESPONSIVELY_MCP_BRIDGE: bridge}, 'linux', tmp);
  assert.equal(entry, bridge);
});

test('RESPONSIVELY_APP_PATH resolves a mac .app directory', () => {
  const tmp = makeTmp();
  const appDir = path.join(tmp, 'ResponsivelyApp.app');
  const bridge = touch(path.join(appDir, 'Contents', 'Resources', 'mcp', 'cli.js'));
  const entry = resolveBridgeEntry({RESPONSIVELY_APP_PATH: appDir}, 'darwin', tmp);
  assert.equal(entry, bridge);
});

test('RESPONSIVELY_APP_PATH resolves a win/linux install dir', () => {
  const tmp = makeTmp();
  const installDir = path.join(tmp, 'ResponsivelyApp');
  const bridge = touch(path.join(installDir, 'resources', 'mcp', 'cli.js'));
  const entry = resolveBridgeEntry({RESPONSIVELY_APP_PATH: installDir}, 'win32', tmp);
  assert.equal(entry, bridge);
});

test('beacon bridgeEntry is used when present', () => {
  const home = makeTmp();
  const bridge = touch(path.join(home, 'somewhere', 'mcp', 'cli.js'));
  const configDir = path.join(home, '.config', 'ResponsivelyApp');
  fs.mkdirSync(configDir, {recursive: true});
  fs.writeFileSync(
    path.join(configDir, 'app-location.json'),
    JSON.stringify({bridgeEntry: bridge})
  );
  const entry = resolveBridgeEntry({}, 'linux', home);
  assert.equal(entry, bridge);
});

test('beacon resourcesPath is expanded to mcp/cli.js', () => {
  const home = makeTmp();
  const resources = path.join(home, 'install', 'resources');
  const bridge = touch(path.join(resources, 'mcp', 'cli.js'));
  const configDir = path.join(home, '.config', 'ResponsivelyApp');
  fs.mkdirSync(configDir, {recursive: true});
  fs.writeFileSync(
    path.join(configDir, 'app-location.json'),
    JSON.stringify({resourcesPath: resources})
  );
  assert.equal(resolveBridgeEntry({}, 'linux', home), bridge);
});

test('corrupt beacon falls through to defaults (none on linux) → null', () => {
  const home = makeTmp();
  const configDir = path.join(home, '.config', 'ResponsivelyApp');
  fs.mkdirSync(configDir, {recursive: true});
  fs.writeFileSync(path.join(configDir, 'app-location.json'), 'not json{');
  assert.equal(resolveBridgeEntry({}, 'linux', home), null);
});

test('stale beacon (paths deleted) falls through', () => {
  const home = makeTmp();
  const configDir = path.join(home, '.config', 'ResponsivelyApp');
  fs.mkdirSync(configDir, {recursive: true});
  fs.writeFileSync(
    path.join(configDir, 'app-location.json'),
    JSON.stringify({bridgeEntry: path.join(home, 'gone', 'cli.js')})
  );
  assert.equal(resolveBridgeEntry({}, 'linux', home), null);
});

test('darwin default falls back to ~/Applications', () => {
  const home = makeTmp();
  const bridge = touch(
    path.join(home, 'Applications', 'ResponsivelyApp.app', 'Contents', 'Resources', 'mcp', 'cli.js')
  );
  const entry = resolveBridgeEntry({}, 'darwin', home);
  assert.equal(entry, bridge);
});

test('nothing found → null', () => {
  assert.equal(resolveBridgeEntry({}, 'linux', makeTmp()), null);
});

test('userDataDir honors platform conventions', () => {
  assert.equal(
    userDataDir('darwin', {}, '/Users/dev'),
    '/Users/dev/Library/Application Support/ResponsivelyApp'
  );
  assert.equal(
    userDataDir('win32', {APPDATA: 'C:\\Users\\dev\\AppData\\Roaming'}, 'C:\\Users\\dev'),
    path.join('C:\\Users\\dev\\AppData\\Roaming', 'ResponsivelyApp')
  );
  assert.equal(
    userDataDir('linux', {XDG_CONFIG_HOME: '/xdg'}, '/home/dev'),
    path.join('/xdg', 'ResponsivelyApp')
  );
  assert.equal(
    userDataDir('linux', {}, '/home/dev'),
    path.join('/home/dev', '.config', 'ResponsivelyApp')
  );
});
