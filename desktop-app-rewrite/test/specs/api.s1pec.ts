import * as fs from 'fs';

const packageJson = JSON.parse(
  fs.readFileSync('./package.json', { encoding: 'utf-8' })
) as Partial<{
  name: string;
  version: string;
}>;
const { name, version } = packageJson;

const waitFor = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

describe('electron APIs', () => {
  describe('custom', () => {
    it('should return the expected response', async () => {
      const result = await browser.electronAPI();
      expect(result).toEqual('test');
    });
  });
  describe('app', () => {
    it('should retrieve app metadata through the electron API', async () => {
      const appName = await browser.electronApp('getName');
      expect(appName).toEqual(name);
      const appVersion = await browser.electronApp('getVersion');
      expect(appVersion).toEqual(version);
    });
  });
  describe('mainProcess', () => {
    it('should retrieve the process type through the electron API', async () => {
      const processType = await browser.electronMainProcess('type');
      expect(processType).toEqual('browser');
    });
  });
  describe('browserWindow', () => {
    it('should retrieve the window title through the electron API', async () => {
      const windowTitle = await browser.electronBrowserWindow('title');
      // TODO: flaky - might need window load timeout
      await waitFor(100);
      expect(windowTitle).toEqual('this is the title of the main window');
    });
  });
});
