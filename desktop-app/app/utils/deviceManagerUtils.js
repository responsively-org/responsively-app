import os from 'os';
import {SSL_ERROR_CODES} from '../constants/values';
import childProcess from 'child_process';

export const MIN_NUMBER_OF_DEVICES = 2;

function exec(command) {
  const output = childProcess.execSync(command, {encoding: 'utf8'});
  return output;
}

export function getPhysicalCpuCount() {
  const platform = os.platform();

  try {
    if (platform === 'linux') {
      const output = exec(
        'lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l'
      );
      return parseInt(output.trim(), 10);
    }
    if (platform === 'darwin') {
      const output = exec('sysctl -n hw.physicalcpu_max');
      return parseInt(output.trim(), 10);
    }
    if (platform === 'win32') {
      const output = exec('WMIC CPU Get NumberOfCores');
      return output
        .split(os.EOL)
        .map(parseInt)
        .filter(value => !Number.isNaN(value))
        .reduce((sum, number) => sum + number, 0);
    }
    throw new Error('Unexpected OS');
  } catch {
    const cores = os.cpus().filter((cpu, index) => {
      const hasHyperthreading = cpu.model.includes('Intel');
      const isOdd = index % 2 === 1;
      return !hasHyperthreading || isOdd;
    });
    return cores.length;
  }
}

// TODO: observe and improve this
export function getRecommendedMaxNumberOfDevices() {
  const logicalCpuInfos = os.cpus();
  const cpuSpeed = logicalCpuInfos[0].speed;
  const cpuCount = logicalCpuInfos.length;

  const value = Math.max(
    MIN_NUMBER_OF_DEVICES,
    Math.trunc(cpuCount * (cpuSpeed / 2000))
  );

  return value;
}

export const recommendedMaxNumberOfDevices = getRecommendedMaxNumberOfDevices();
