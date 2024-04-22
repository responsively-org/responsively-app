import { Icon } from '@iconify/react';
import { DOCK_POSITION } from 'common/constants';
import { OpenDevtoolsArgs, OpenDevtoolsResult } from 'main/devtools';
import { Resizable, Size } from 're-resizable';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  DockPosition,
  selectDevtoolsWebviewId,
  selectDockPosition,
  setDockPosition,
  setDevtoolsClose,
} from 'renderer/store/features/devtools';
import {
  selectIsInspecting,
  setIsInspecting,
} from 'renderer/store/features/renderer';

type SizeValue = number | string;

interface DockConfig {
  resizeDirections: { [key: string]: boolean };
  defaultSize: {
    width: SizeValue;
    height: SizeValue;
  };
  toggle: {
    icon: string;
    position: DockPosition;
  };
}

const BottomDockConfig: DockConfig = {
  resizeDirections: { top: true },
  defaultSize: { width: '100vw', height: 500 },
  toggle: {
    icon: 'mdi:dock-right',
    position: DOCK_POSITION.RIGHT,
  },
};

const RightDockConfig: DockConfig = {
  resizeDirections: { left: true },
  defaultSize: { width: 500, height: '100vh' },
  toggle: {
    icon: 'mdi:dock-bottom',
    position: DOCK_POSITION.BOTTOM,
  },
};

const DevtoolsResizer = () => {
  const dispatch = useDispatch();
  const dockPosition = useSelector(selectDockPosition);
  const webviewId = useSelector(selectDevtoolsWebviewId);
  const isInspecting = useSelector(selectIsInspecting);

  let config = BottomDockConfig;
  if (dockPosition === DOCK_POSITION.RIGHT) {
    config = RightDockConfig;
  }
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<SizeValue>(config.defaultSize.width);
  const [height, setHeight] = useState<SizeValue>(config.defaultSize.height);
  const [sizeBeforeResize, setSizeBeforeResize] = useState<Size>({
    width: 0,
    height: 0,
  });

  const resizeEffect = () => {
    if (ref.current == null || ref.current.parentNode == null) {
      return;
    }
    if (ref.current?.getBoundingClientRect() == null) {
      return;
    }
    const margin = 28;
    const {
      x,
      y,
      height: h,
      width: w,
    } = ref.current?.getBoundingClientRect() || {};
    const bounds = { x, y: y + margin, height: h - margin, width: w };
    window.electron.ipcRenderer.invoke('resize-devtools', { bounds });
  };

  useEffect(() => {
    setHeight(config.defaultSize.height);
    setWidth(config.defaultSize.width);
  }, [config]);

  useEffect(() => {
    resizeEffect();
  }, [width, height, ref, dockPosition]);
  useEffect(() => {
    setTimeout(() => {
      resizeEffect();
    });
  }, []);

  return (
    <div className="border-[#d0d0d0] bg-[#f3f3f3] text-[#555]">
      <Resizable
        className="border"
        key={dockPosition}
        size={{ width, height }}
        onResizeStart={() => setSizeBeforeResize({ width, height })}
        onResizeStop={() => setSizeBeforeResize({ width: 0, height: 0 })}
        onResize={(_, __, ___, d) => {
          setWidth((sizeBeforeResize.width as number) + d.width);
          setHeight((sizeBeforeResize.height as number) + d.height);
        }}
        enable={config.resizeDirections}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex justify-between border-b-[1px]">
            <div>
              <Button
                onClick={() => dispatch(setIsInspecting(!isInspecting))}
                isActive={isInspecting}
                disableHoverEffects
              >
                <Icon icon="lucide:inspect" />
              </Button>
            </div>
            <div className="flex">
              <Button
                onClick={() => {
                  dispatch(setDockPosition(config.toggle.position));
                }}
                disableHoverEffects
              >
                <Icon icon={config.toggle.icon} />
              </Button>
              <Button
                onClick={() => {
                  window.electron.ipcRenderer.invoke('close-devtools');
                  dispatch(setDockPosition(DOCK_POSITION.UNDOCKED));
                  dispatch(setDevtoolsClose());
                  setTimeout(() => {
                    window.electron.ipcRenderer.invoke<
                      OpenDevtoolsArgs,
                      OpenDevtoolsResult
                    >('open-devtools', {
                      webviewId,
                      dockPosition: DOCK_POSITION.UNDOCKED,
                    });
                  });
                }}
                disableHoverEffects
              >
                <Icon icon="mdi:dock-window" />
              </Button>
              <Button
                onClick={() => {
                  window.electron.ipcRenderer.invoke('close-devtools');
                  dispatch(setDevtoolsClose());
                }}
                disableHoverEffects
              >
                <Icon icon="ic:round-close" />
              </Button>
            </div>
          </div>
          <div className="flex-grow" ref={ref} />
        </div>
      </Resizable>
    </div>
  );
};

export default DevtoolsResizer;
