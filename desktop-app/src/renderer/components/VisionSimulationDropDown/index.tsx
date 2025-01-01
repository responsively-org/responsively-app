import cx from 'classnames';
import { Icon } from '@iconify/react';
import { DropDown } from '../DropDown';

const MenuItemLabel = ({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) => {
  return (
    <div className="justify-normal flex w-full flex-shrink-0 items-center gap-1 whitespace-nowrap">
      <Icon
        icon="ic:round-check"
        className={cx('opacity-0', {
          'opacity-100': isActive,
        })}
      />
      <span
        className={cx('capitalize', {
          'font-semibold text-black dark:text-white': isActive,
        })}
      >
        {label}
      </span>
    </div>
  );
};

const MenuItemHeader = ({ label }: { label: string }) => {
  return (
    <div className="relative flex w-full min-w-44 items-center justify-between gap-1 whitespace-nowrap">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      <span className="mxl-1 z-10 flex-shrink-0 bg-slate-100 pr-2 dark:bg-slate-900">
        {label}
      </span>
    </div>
  );
};

export const SIMULATIONS = {
  DEUTERANOPIA: 'deuteranopia',
  DEUTERANOMALY: 'deuteranomaly',
  PROTANOPIA: 'protanopia',
  PROTANOMALY: 'protanomaly',
  TRITANOPIA: 'tritanopia',
  TRITANOMALY: 'tritanomaly',
  ACHROMATOMALY: 'achromatomaly',
  ACHROMATOPSIA: 'achromatopsia',
  CATARACT: 'cataract',
  FAR: 'farsightedness',
  GLAUCOME: 'glaucoma',
  SOLARIZE: 'solarize',
  COLOR_CONTRAST_LOSS: 'color-contrast-loss',
};

export const RED_GREEN = [
  SIMULATIONS.DEUTERANOPIA,
  SIMULATIONS.DEUTERANOMALY,
  SIMULATIONS.PROTANOPIA,
  SIMULATIONS.PROTANOMALY,
];
export const BLUE_YELLOW = [SIMULATIONS.TRITANOPIA, SIMULATIONS.TRITANOMALY];
export const FULL = [SIMULATIONS.ACHROMATOMALY, SIMULATIONS.ACHROMATOPSIA];
export const VISUAL_IMPAIRMENTS = [
  SIMULATIONS.CATARACT,
  SIMULATIONS.FAR,
  SIMULATIONS.GLAUCOME,
  SIMULATIONS.COLOR_CONTRAST_LOSS,
];
export const SUNLIGHT = [SIMULATIONS.SOLARIZE];

interface Props {
  simulationName: string | undefined;
  onChange: (name: string | undefined) => void;
}

export const VisionSimulationDropDown = ({
  simulationName,
  onChange,
}: Props) => {
  return (
    <DropDown
      className={cx('rounded-lg text-xs', {
        'bg-slate-400/60': simulationName != null,
      })}
      label={<Icon icon="bx:low-vision" fontSize={18} />}
      options={[
        {
          label: <MenuItemHeader label="No deficiency" />,
          onClick: null,
        },
        {
          label: (
            <MenuItemLabel
              label="Disable tool"
              isActive={simulationName === undefined}
            />
          ),
          onClick: () => {
            onChange(undefined);
          },
        },
        {
          label: <MenuItemHeader label="Red-green deficiency" />,
          onClick: null,
        },
        ...RED_GREEN.map((x: string) => {
          return {
            label: (
              <MenuItemLabel
                label={x}
                isActive={simulationName === x.toLowerCase()}
              />
            ),
            onClick: () => {
              onChange(x.toLowerCase());
            },
          };
        }),
        {
          label: <MenuItemHeader label="Blue-yellow deficiency" />,
          onClick: null,
        },
        ...BLUE_YELLOW.map((x: string) => {
          return {
            label: (
              <MenuItemLabel
                label={x}
                isActive={simulationName === x.toLowerCase()}
              />
            ),
            onClick: () => {
              onChange(x.toLowerCase());
            },
          };
        }),
        {
          label: <MenuItemHeader label="Full color deficiency" />,
          onClick: null,
        },
        ...FULL.map((x: string) => {
          return {
            label: (
              <MenuItemLabel
                label={x}
                isActive={simulationName === x.toLowerCase()}
              />
            ),
            onClick: () => {
              onChange(x.toLowerCase());
            },
          };
        }),
        {
          label: <MenuItemHeader label="Visual impairment" />,
          onClick: null,
        },
        ...VISUAL_IMPAIRMENTS.map((x: string) => {
          return {
            label: (
              <MenuItemLabel
                label={x}
                isActive={simulationName === x.toLowerCase()}
              />
            ),
            onClick: () => {
              onChange(x.toLowerCase());
            },
          };
        }),
        {
          label: <MenuItemHeader label="Temporary impairment" />,
          onClick: null,
        },
        ...SUNLIGHT.map((x: string) => {
          return {
            label: (
              <MenuItemLabel
                label={x}
                isActive={simulationName === x.toLowerCase()}
              />
            ),
            onClick: () => {
              onChange(x.toLowerCase());
            },
          };
        }),
      ]}
    />
  );
};
