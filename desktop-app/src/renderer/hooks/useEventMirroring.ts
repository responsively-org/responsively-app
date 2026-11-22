import {RefObject, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {EVENT_MIRRORING_CHANNELS} from 'common/event-mirroring';
import {applyEventMirroring} from 'renderer/lib/event-mirroring';
import type {RootState} from 'renderer/store';
import {selectEventMirroringEnabled} from 'renderer/store/features/event-mirroring';

/** Reapply the shared preference to each new guest document without reloading it. */
export default function useEventMirroring(
  ref: RefObject<Electron.WebviewTag | null>,
  deviceId: string
) {
  const enabled = useSelector((state: RootState) => selectEventMirroringEnabled(state, deviceId));

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return undefined;
    const apply = () => {
      void applyEventMirroring(webview, enabled).catch((error) => {
        console.error('Could not apply event mirroring', error);
      });
    };
    const onMessage = (event: Electron.IpcMessageEvent) => {
      if (event.channel === EVENT_MIRRORING_CHANNELS.READY) apply();
    };
    webview.addEventListener('dom-ready', apply);
    webview.addEventListener('ipc-message', onMessage);
    apply();
    return () => {
      webview.removeEventListener('dom-ready', apply);
      webview.removeEventListener('ipc-message', onMessage);
    };
  }, [ref, enabled]);
}
