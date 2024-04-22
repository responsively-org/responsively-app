import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  selectActiveSuite,
  selectSuites,
} from 'renderer/store/features/device-manager';
import { CreateSuiteButton } from './CreateSuiteButton';
import { Suite } from './Suite';

export const PreviewSuites = () => {
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);

  return (
    <div className="flex flex-col">
      <p className="mb-6 text-lg">Preview Suites</p>
      <div className="flex w-full items-center gap-4 overflow-x-auto">
        <div className="flex flex-shrink-0 gap-4">
          {suites.map((suite) => (
            <Suite
              suite={suite}
              isActive={suite.id === activeSuite.id}
              key={suite.name}
            />
          ))}
        </div>
        <CreateSuiteButton />
      </div>
    </div>
  );
};
