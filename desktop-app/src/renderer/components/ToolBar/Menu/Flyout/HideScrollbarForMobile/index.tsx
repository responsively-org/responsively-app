import { useState } from 'react';
import Toggle from 'renderer/components/Toggle';

const HideScrollBarForMobile = () => {
  const [allowed, setAllowed] = useState<boolean>(
    window.electron.store.get('userPreferences.hideScrollbarForMobile')
  );

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Hide Scrollbar for Mobile</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Toggle
          isOn={allowed}
          onChange={(value) => {
            setAllowed(value.target.checked);
            window.electron.store.set(
              'userPreferences.hideScrollbarForMobile',
              value.target.checked
            );
          }}
        />
      </div>
    </div>
  );
};

export default HideScrollBarForMobile;
