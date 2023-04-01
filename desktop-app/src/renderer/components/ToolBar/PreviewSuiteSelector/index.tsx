import { Icon } from '@iconify/react';
import { active } from 'browser-sync';
import { useDispatch, useSelector } from 'react-redux';
import { DropDown } from 'renderer/components/DropDown';
import {
  selectActiveSuite,
  selectSuites,
  setActiveSuite,
} from 'renderer/store/features/device-manager';

export const PreviewSuiteSelector = () => {
  const dispatch = useDispatch();
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);
  return (
    <DropDown
      label={<Icon icon="heroicons:swatch" fontSize={18} />}
      options={suites.map((suite) => ({
        label: (
          <div className="flex w-full items-center justify-between">
            <span>{suite.name}</span>
            {suite.id === activeSuite.id ? <Icon icon="mdi:check" /> : null}
          </div>
        ),
        onClick: () => dispatch(setActiveSuite(suite.id)),
      }))}
    />
  );
};
