import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import { CreateSuiteModal } from './CreateSuiteModal';

export const CreateSuiteButton = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="relative flex aspect-square h-full min-h-52 flex-shrink-0 flex-col items-center justify-center gap-4 rounded bg-white dark:bg-slate-900">
      <span className="absolute top-12">Add Suite</span>
      <Button
        className="aspect-square w-16 rounded-full"
        onClick={() => setOpen(true)}
      >
        <Icon icon="mdi:plus" fontSize={30} />
      </Button>
      <CreateSuiteModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};
