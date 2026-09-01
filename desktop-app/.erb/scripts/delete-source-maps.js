import path from 'path';
import {rimrafSync} from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

export default function deleteSourceMaps() {
  rimrafSync(path.join(webpackPaths.distMainPath, '*.js.map'), {glob: true});
  rimrafSync(path.join(webpackPaths.distRendererPath, '*.js.map'), {glob: true});
}
