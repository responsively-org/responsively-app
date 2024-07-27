import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  selectActiveSuite,
  selectSuites,
} from 'renderer/store/features/device-manager';
import { CreateSuiteButton } from './CreateSuiteButton';
import { Suite } from './Suite';
import { useState } from 'react';

export const PreviewSuites = () => {
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center gap-2 text-lg">
        <Icon icon="heroicons:swatch" /> Preview Suites
        <div className="space-between">
          <Button className="aspect-square w-16" onClick={() => setOpen(true)}>
            <Icon
              icon="mdi:folder-upload"
              fontSize={8}
              onClick={() => setOpen(true)}
            />{' '}
            Import Devices
          </Button>
          <Button className="aspect-square" onClick={() => setOpen(true)}>
            <Icon
              icon="mdi:folder-download"
              fontSize={8}
              onClick={() => setOpen(true)}
            />
            Export Devices
          </Button>
        </div>
      </div>
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
