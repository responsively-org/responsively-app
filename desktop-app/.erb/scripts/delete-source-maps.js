import path from 'path';
import rimraf from 'rimraf';
import { sync as globSync } from 'glob';
import webpackPaths from '../configs/webpack.paths';

function removePatternFiles(pattern) {
  const files = globSync(pattern, { nodir: true });
  files.forEach((f) => rimraf.sync(f));
}

export default function deleteSourceMaps() {
  // On Windows passing globs directly to some path APIs can trigger
  // "Illegal characters in path" errors. Resolve the glob first and
  // delete matched files individually.
  removePatternFiles(path.join(webpackPaths.distMainPath, '*.js.map'));
  removePatternFiles(path.join(webpackPaths.distRendererPath, '*.js.map'));
}
