import { Icon } from '@iconify/react';
import Button from 'renderer/components/Button';

const ClearHistory = () => {
  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Clear History</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Button
          subtle
          onClick={() => {
            window.electron.store.set('history', []);
          }}
        >
          <Icon icon="carbon:trash-can" />
        </Button>
      </div>
    </div>
  );
};

export default ClearHistory;
