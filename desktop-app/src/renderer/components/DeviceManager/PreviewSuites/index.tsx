import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  selectActiveSuite,
  selectSuites,
} from 'renderer/store/features/device-manager';
import { Suite } from './Suite';

export const PreviewSuites = () => {
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);

  return (
    <div className="flex flex-col">
      <p className="mb-6 text-lg">Preview Suites</p>
      <div className="flex w-full gap-4">
        {suites.map((suite) => (
          <Suite
            suite={suite}
            isActive={suite.id === activeSuite.id}
            key={suite.name}
          />
        ))}
        <div className="flex aspect-square h-full min-h-52 items-center justify-center rounded bg-white dark:bg-slate-900">
          <Button className="aspect-square w-24 rounded-full">
            <Icon icon="mdi:plus" fontSize={30} />
          </Button>
        </div>
      </div>
    </div>
  );
};
