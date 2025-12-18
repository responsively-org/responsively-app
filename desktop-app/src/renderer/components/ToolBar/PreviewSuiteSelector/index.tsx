import { Icon } from '@iconify-icon/react';
import { useDispatch, useSelector } from 'react-redux';
import DropDown from 'renderer/components/DropDown';
import {
  selectActiveSuite,
  selectSuites,
  setActiveSuite,
} from 'renderer/store/features/device-manager';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';

function PreviewSuiteSelector() {
  const dispatch = useDispatch();
  const suites = useSelector(selectSuites);
  const activeSuite = useSelector(selectActiveSuite);
  return (
    <DropDown
      label={<Icon icon="heroicons:swatch" className="text-[18px]" />}
      options={[
        ...suites.map((suite) => ({
          label: (
            <div className="flex w-full items-center justify-between gap-12 whitespace-nowrap">
              <span>{suite.name}</span>
              {suite.id === activeSuite.id ? <Icon icon="mdi:check" /> : null}
            </div>
          ),
          onClick: () => dispatch(setActiveSuite(suite.id)),
        })),
        {
          type: 'separator',
        },
        {
          label: (
            <div className="flex w-full shrink-0 items-center justify-between gap-12 whitespace-nowrap">
              <span>Manage Suites</span>
            </div>
          ),
          onClick: () => {
            dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
          },
        },
      ]}
    />
  );
}

export default PreviewSuiteSelector
