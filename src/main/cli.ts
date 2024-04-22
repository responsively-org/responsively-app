import parseArgs from 'electron-args';

let binaryName = 'ResponsivelyApp';

if (process.platform === 'darwin') {
  binaryName =
    '/Applications/ResponsivelyApp.app/Contents/MacOS/ResponsivelyApp';
}

if (process.platform === 'win32') {
  binaryName = 'ResponsivelyApp.exe';
}

const cli = parseArgs(
  `
      ResponsivelyApp
   
      Usage
        $ ${binaryName} [path]
   
      Options
        --help     show help
        --version  show version
   
      Examples
        $ ${binaryName} https://example.com
        $ ${binaryName} /path/to/index.html
  `,
  {
    alias: {
      h: 'help',
    },
  }
);

export default cli;
