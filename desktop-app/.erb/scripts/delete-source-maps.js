import path from 'path';
import {rimrafSync} from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

export default function deleteSourceMaps() {
  // rimraf stopped expanding globs by default in v4 — opt back in.
  rimrafSync(path.join(webpackPaths.distMainPath, '*.js.map'), {glob: true});
  rimrafSync(path.join(webpackPaths.distRendererPath, '*.js.map'), {glob: true});
}
