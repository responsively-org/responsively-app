import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  selectActiveSuite,
  selectSuites,
} from 'renderer/store/features/device-manager';
import { useState } from 'react';
import { FileUploader } from 'renderer/components/FileUploader';
import Modal from 'renderer/components/Modal';
import { Suite } from './Suite';
import { CreateSuiteButton } from './CreateSuiteButton';
import { ManageSuitesTool } from './ManageSuitesTool/ManageSuitesTool';

export const PreviewSuites = () => {
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);
  console.log(suites, 'suites');
  return (
    <div className="flex flex-col">
      <div className="space-between mb-6 flex w-full flex-row items-center gap-2 text-lg">
        <div className="align-items-center flex flex-row justify-center">
          <Icon icon="heroicons:swatch" />{' '}
          <p className="pl-2">Preview Suites</p>
        </div>
        <ManageSuitesTool />
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
