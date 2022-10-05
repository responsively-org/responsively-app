import { Icon } from '@iconify/react';
import { Resizable, Size } from 're-resizable';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import { setIsOpen } from 'renderer/store/features/devtools';

type SizeValue = number | string;

const DevtoolsResizer = () => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<SizeValue>('100vw');
  const [height, setHeight] = useState<SizeValue>(500);
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
    const { x, y, height, width } = ref.current?.getBoundingClientRect() || {};
    const bounds = { x, y: y + margin, height: height - margin, width };
    window.electron.ipcRenderer.invoke('resize-devtools', { bounds });
  };

  useEffect(() => {
    resizeEffect();
  }, [width, height, ref]);
  useEffect(() => {
    setTimeout(() => {
      resizeEffect();
    }, 200);
  }, []);

  return (
    <div className="border-[#d0d0d0] bg-[#f3f3f3] text-[#555]">
      <Resizable
        className="border"
        size={{ width, height }}
        onResizeStart={() => setSizeBeforeResize({ width, height })}
        onResizeStop={() => setSizeBeforeResize({ width: 0, height: 0 })}
        onResize={(_, __, ___, d) => {
          setWidth((sizeBeforeResize.width as number) + d.width);
          setHeight((sizeBeforeResize.height as number) + d.height);
        }}
        enable={{ top: true }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex justify-between border-b-[1px]">
            <Button
              onClick={() => {
                console.log('Inspect element');
              }}
              disableHoverEffects={true}
            >
              <Icon icon="lucide:inspect" />
            </Button>
            <Button
              onClick={() => {
                window.electron.ipcRenderer.invoke('close-devtools');
                dispatch(setIsOpen(false));
              }}
              disableHoverEffects={true}
            >
              <Icon icon="ic:round-close" />
            </Button>
          </div>
          <div className="flex-grow" ref={ref}></div>
        </div>
      </Resizable>
    </div>
  );
};

export default DevtoolsResizer;
