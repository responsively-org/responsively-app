import { FC, useId } from 'react';

interface ISettingsContentHeaders {
  acceptLanguage: string;
  setAcceptLanguage: (arg0: string) => void;
}

export const SettingsContentHeaders: FC<ISettingsContentHeaders> = ({
  acceptLanguage = '',
  setAcceptLanguage,
}) => {
  const id = useId();

  return (
    <>
      <h2>Request Headers</h2>
      <div className="my-4 flex flex-col space-y-4 text-sm">
        <div className="flex flex-col space-y-2">
          <label htmlFor={id} className="flex flex-col">
            Accept-Language
            <input
              data-testid="settings-accept_language-input"
              type="text"
              id={id}
              placeholder="example: en-US"
              className="mt-2 rounded-md border border-gray-300 px-4 py-2 text-base focus-visible:outline-gray-400 dark:border-gray-500 dark:bg-slate-900"
              value={acceptLanguage}
              onChange={(e) => setAcceptLanguage(e.target.value)}
            />
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            HTTP request Accept-Language parameter (default: language from OS
            locale settings)
          </p>
        </div>
      </div>
    </>
  );
};
