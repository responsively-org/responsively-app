import fs from 'fs';
import pc from 'picocolors';
import {execSync} from 'child_process';
import {dependencies} from '../../package.json';

if (dependencies) {
  const dependenciesKeys = Object.keys(dependencies);
  const nativeDeps = fs
    .readdirSync('node_modules')
    .filter((folder) => fs.existsSync(`node_modules/${folder}/binding.gyp`));
  if (nativeDeps.length === 0) {
    process.exit(0);
  }
  try {
    // Find the reason for why the dependency is installed. If it is installed
    // because of a devDependency then that is okay. Warn when it is installed
    // because of a dependency
    const {dependencies: dependenciesObject} = JSON.parse(
      execSync(`npm ls ${nativeDeps.join(' ')} --json`).toString()
    );
    const rootDependencies = Object.keys(dependenciesObject);
    const filteredRootDependencies = rootDependencies.filter((rootDependency) =>
      dependenciesKeys.includes(rootDependency)
    );
    if (filteredRootDependencies.length > 0) {
      const plural = filteredRootDependencies.length > 1;
      console.log(`
 ${pc.whiteBright(pc.bgYellow(pc.bold('Webpack does not work with native dependencies.')))}
${pc.bold(filteredRootDependencies.join(', '))} ${
        plural ? 'are native dependencies' : 'is a native dependency'
      } and should be installed inside of the "./release/app" folder.
 First, uninstall the packages from "./package.json":
${pc.whiteBright(pc.bgGreen(pc.bold('npm uninstall your-package')))}
 ${pc.bold('Then, instead of installing the package to the root "./package.json":')}
${pc.whiteBright(pc.bgRed(pc.bold('npm install your-package')))}
 ${pc.bold('Install the package to "./release/app/package.json"')}
${pc.whiteBright(pc.bgGreen(pc.bold('cd ./release/app && npm install your-package')))}
 Read more about native dependencies at:
${pc.bold('https://electron-react-boilerplate.js.org/docs/adding-dependencies/#module-structure')}
 `);
      process.exit(1);
    }
  } catch (e) {
    console.log('Native dependencies could not be checked');
  }
}
