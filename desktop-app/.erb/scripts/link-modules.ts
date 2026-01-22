import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const { srcNodeModulesPath, appNodeModulesPath, erbNodeModulesPath } =
  webpackPaths;

if (fs.existsSync(appNodeModulesPath)) {
  if (!fs.existsSync(srcNodeModulesPath)) {
    fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
  }
  if (!fs.existsSync(erbNodeModulesPath)) {
    fs.symlinkSync(appNodeModulesPath, erbNodeModulesPath, 'junction');
  }
}
