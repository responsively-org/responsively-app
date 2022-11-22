import { useState } from 'react';
import Toggle from 'renderer/components/Toggle';

const AllowInSecureSSL = () => {
  const [allowed, setAllowed] = useState<boolean>(
    window.electron.store.get('userPreferences.allowInsecureSSLConnections')
  );

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Allow Insecure SSL</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Toggle
          isOn={allowed}
          onChange={(value) => {
            setAllowed(value.target.checked);
            window.electron.store.set(
              'userPreferences.allowInsecureSSLConnections',
              value.target.checked
            );
          }}
        />
      </div>
    </div>
  );
};

export default AllowInSecureSSL;
