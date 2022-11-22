import os from 'os';

export const MIN_NUMBER_OF_DEVICES = 2;

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
