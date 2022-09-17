import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';

interface Props {
  webview: Electron.WebviewTag;
}

const Toolbar = ({ webview }: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);

  const toggleEventMirroring = async () => {
    if (webview == null) {
      return;
    }
    try {
      await webview.executeJavaScript(
        `
        if(window.___browserSync___){
          window.___browserSync___.socket.${
            eventMirroringOff ? 'open' : 'close'
          }()
        }
        true
      `
      );
      setEventMirroringOff(!eventMirroringOff);
    } catch (error) {
      console.error('Error while toggleing event mirroring', error);
    }
  };

  return (
    <div className="my-1 flex gap-4">
      <Button onClick={toggleEventMirroring} isActive={eventMirroringOff}>
        <Icon icon="fluent:plug-disconnected-24-regular" />
      </Button>
    </div>
  );
};

export default Toolbar;
