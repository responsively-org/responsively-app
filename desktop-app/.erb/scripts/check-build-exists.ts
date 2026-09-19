// Check if the renderer and main bundles are built
import path from 'path';
import pc from 'picocolors';
import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const mainPath = path.join(webpackPaths.distMainPath, 'main.js');
const rendererPath = path.join(webpackPaths.distRendererPath, 'renderer.js');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    pc.whiteBright(
      pc.bgRed(
        pc.bold('The main process is not built yet. Build it by running "yarn run build:main"')
      )
    )
  );
}

if (!fs.existsSync(rendererPath)) {
  throw new Error(
    pc.whiteBright(
      pc.bgRed(
        pc.bold(
          'The renderer process is not built yet. Build it by running "yarn run build:renderer"'
        )
      )
    )
  );
}
