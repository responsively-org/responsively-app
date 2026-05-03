import path from 'path';
import rimraf from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

export default function deleteSourceMaps() {
  rimraf.sync(path.join(webpackPaths.distMainPath, '*.js.map'), {glob: true});
  rimraf.sync(path.join(webpackPaths.distRendererPath, '*.js.map'), {glob: true});
}
