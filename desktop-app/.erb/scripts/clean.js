import {rimrafSync} from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

const foldersToRemove = [webpackPaths.distPath, webpackPaths.buildPath, webpackPaths.dllPath];

foldersToRemove.forEach((folder) => {
  rimrafSync(folder);
});
