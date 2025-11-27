import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAddress,
  selectLayout,
  selectRotate,
  setAddress,
  setLayout,
  setRotate,
} from 'renderer/store/features/renderer';
import {
  selectActiveSuite,
  selectSuites,
  addSuite,
  setActiveSuite,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import {
  selectDeviceRotationState,
  setAllDeviceRotations,
} from 'renderer/store/features/device-orientation';
import { PREVIEW_LAYOUTS } from 'common/constants';
import type { SessionSnapshot } from 'common/session';
import { isPreviewLayout } from 'common/session';
import Button from '../Button';
import Modal from '../Modal';

type SnapshotPayload = Omit<SessionSnapshot, 'timestamp' | 'shouldPrompt'>;

const areDeviceListsEqual = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((id, index) => id === b[index]);
};

const SessionRestoreManager = () => {
  const dispatch = useDispatch();
  const address = useSelector(selectAddress);
  const layout = useSelector(selectLayout);
  const rotateDevices = useSelector(selectRotate);
  const activeSuite = useSelector(selectActiveSuite);
  const suites = useSelector(selectSuites);
  const deviceRotations = useSelector(selectDeviceRotationState);
  const [pendingSnapshot, setPendingSnapshot] =
    useState<SessionSnapshot | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const payloadRef = useRef<SnapshotPayload | null>(null);

  useEffect(() => {
    const snapshot = window.electron?.store.get('session.lastSnapshot') as
      | SessionSnapshot
      | undefined;
    if (snapshot?.shouldPrompt) {
      setPendingSnapshot(snapshot);
      setDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!activeSuite) {
      return;
    }
    payloadRef.current = {
      address,
      layout,
      rotateAllDevices: rotateDevices,
      activeSuiteId: activeSuite.id,
      activeSuiteName: activeSuite.name,
      deviceIds: [...activeSuite.devices],
      perDeviceRotations: { ...deviceRotations },
    };
  }, [address, layout, rotateDevices, activeSuite, deviceRotations]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!payloadRef.current) {
        return;
      }
      window.electron?.store.set('session.lastSnapshot', {
        ...payloadRef.current,
        timestamp: Date.now(),
        shouldPrompt: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const markSnapshotHandled = () => {
    if (!pendingSnapshot) {
      return;
    }
    window.electron?.store.set('session.lastSnapshot', {
      ...pendingSnapshot,
      shouldPrompt: false,
      timestamp: Date.now(),
    });
  };

  const handleDismiss = () => {
    markSnapshotHandled();
    setDialogOpen(false);
    setPendingSnapshot(null);
  };

  const handleRestore = () => {
    if (!pendingSnapshot) {
      return;
    }
    const snapshotDevices = pendingSnapshot.deviceIds ?? [];
    const targetSuite = suites.find(
      (suite) => suite.id === pendingSnapshot.activeSuiteId
    );
    if (targetSuite) {
      if (
        snapshotDevices.length > 0 &&
        !areDeviceListsEqual(targetSuite.devices, snapshotDevices)
      ) {
        dispatch(
          setSuiteDevices({
            suite: targetSuite.id,
            devices: snapshotDevices,
          })
        );
      }
      dispatch(setActiveSuite(targetSuite.id));
    } else if (snapshotDevices.length > 0) {
      const restoredSuiteId = pendingSnapshot.activeSuiteId;
      dispatch(
        addSuite({
          id: restoredSuiteId,
          name: pendingSnapshot.activeSuiteName?.trim() || 'Restored session',
          devices: snapshotDevices,
        })
      );
      dispatch(setActiveSuite(restoredSuiteId));
    }
    dispatch(setAddress(pendingSnapshot.address));
    dispatch(setRotate(pendingSnapshot.rotateAllDevices));
    dispatch(
      setLayout(
        isPreviewLayout(pendingSnapshot.layout)
          ? pendingSnapshot.layout
          : PREVIEW_LAYOUTS.COLUMN
      )
    );
    dispatch(setAllDeviceRotations(pendingSnapshot.perDeviceRotations || {}));
    markSnapshotHandled();
    setDialogOpen(false);
    setPendingSnapshot(null);
  };

  if (!pendingSnapshot) {
    return null;
  }

  const deviceCount = pendingSnapshot.deviceIds?.length ?? 0;

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={handleDismiss}
      title="Restore previous session"
      description="Would you like to reopen the last workspace?"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <p className="font-semibold">URL</p>
          <p className="truncate text-xs">
            {pendingSnapshot.address || 'No saved address'}
          </p>
          <p className="mt-2 font-semibold">Device suite</p>
          <p className="text-xs">
            {pendingSnapshot.activeSuiteName ||
              pendingSnapshot.activeSuiteId ||
              'Unknown suite'}
          </p>
          <p className="mt-2 font-semibold">Active devices</p>
          <p className="text-xs">
            {deviceCount} device(s) ·
            {pendingSnapshot.rotateAllDevices
              ? ' rotated'
              : ' default orientation'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleDismiss}>Not now</Button>
          <Button onClick={handleRestore}>Restore</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionRestoreManager;
