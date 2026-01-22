import { Icon } from '@iconify-icon/react';
import { useState, useEffect, useRef } from 'react';
import { IPC_MAIN_CHANNELS, SitePermission } from 'common/constants';
import { webViewPubSub } from 'renderer/lib/pubsub';
import { NAVIGATION_EVENTS } from 'renderer/components/ToolBar/NavigationControls';

const PERMISSION_STATES = {
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  PROMPT: 'PROMPT',
  UNKNOWN: 'UNKNOWN',
} as const;

interface SitePermissionsDropdownProps {
  currentAddress: string;
  isVisible: boolean;
  onClose: () => void;
}

interface PermissionToggleProps {
  permission: SitePermission;
  onToggle: (type: string, state: string) => void;
}

function PermissionToggle({ permission, onToggle }: PermissionToggleProps) {
  const getStateDisplay = (state: string) => {
    switch (state) {
      case PERMISSION_STATES.GRANTED:
        return {
          text: 'Allow',
          color: 'text-green-600 dark:text-green-400',
          icon: 'mdi:check-circle',
        };
      case PERMISSION_STATES.DENIED:
        return {
          text: 'Block',
          color: 'text-red-600 dark:text-red-400',
          icon: 'mdi:block-helper',
        };
      default:
        return {
          text: 'Ask',
          color: 'text-gray-600 dark:text-gray-400',
          icon: 'mdi:help-circle',
        };
    }
  };

  const cycleState = () => {
    const states = [
      PERMISSION_STATES.UNKNOWN,
      PERMISSION_STATES.GRANTED,
      PERMISSION_STATES.DENIED,
    ];
    const currentIndex = states.findIndex(
      (state) => state === permission.state,
    );
    const nextIndex = (currentIndex + 1) % states.length;
    onToggle(permission.type, states[nextIndex]);
  };

  const display = getStateDisplay(permission.state);

  return (
    <div className="flex items-center justify-between rounded py-2 px-2 hover:bg-gray-100 dark:hover:bg-slate-700">
      <div className="flex items-center gap-2">
        <Icon icon={permission.icon} className="text-sm" />
        <span className="text-xs">{permission.displayName}</span>
      </div>
      <button
        type="button"
        onClick={cycleState}
        className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-gray-200 dark:hover:bg-slate-600 ${display.color}`}
      >
        <Icon icon={display.icon} className="text-xs" />
        {display.text}
      </button>
    </div>
  );
}

function SitePermissionsDropdown({
  currentAddress,
  isVisible,
  onClose,
}: SitePermissionsDropdownProps) {
  const [sitePermissions, setSitePermissions] = useState<SitePermission[]>([]);
  const [origin, setOrigin] = useState<string>('');
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const refreshPage = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Use the webview pubsub system to reload all webviews
      webViewPubSub.publish(NAVIGATION_EVENTS.RELOAD);

      // Hide refresh notification after a brief delay
      setTimeout(() => {
        setShowRefreshNotification(false);
        setIsRefreshing(false);
      }, 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh page:', error);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const getOriginFromUrl = (url: string) => {
      try {
        if (url.startsWith('file://')) return 'Local File';
        const urlObj = new URL(url);
        return urlObj.origin;
      } catch {
        return 'Invalid URL';
      }
    };

    const currentOrigin = getOriginFromUrl(currentAddress);
    setOrigin(currentOrigin);

    const loadSitePermissions = async () => {
      if (
        currentOrigin &&
        currentOrigin !== 'Local File' &&
        currentOrigin !== 'Invalid URL'
      ) {
        try {
          const permissions = (await window.electron.ipcRenderer.invoke(
            IPC_MAIN_CHANNELS.GET_SITE_PERMISSIONS,
            currentOrigin,
          )) as SitePermission[];
          setSitePermissions(permissions);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load site permissions:', error);
          setSitePermissions([]);
        }
      } else {
        setSitePermissions([]);
      }
    };

    if (isVisible) {
      loadSitePermissions();
    }
  }, [currentAddress, isVisible]);

  // Listen for permission updates from the main process
  useEffect(() => {
    const handlePermissionUpdate = (args: {
      origin: string;
      type: string;
      state: string;
    }) => {
      // Only update if it's for the current origin
      if (args.origin === origin) {
        setSitePermissions((prev) =>
          prev.map((p) =>
            p.type === args.type
              ? { ...p, state: args.state as SitePermission['state'] }
              : p,
          ),
        );

        // Show refresh notification when permission changes
        setShowRefreshNotification(true);
      }
    };

    window.electron.ipcRenderer.on(
      IPC_MAIN_CHANNELS.PERMISSION_UPDATED,
      handlePermissionUpdate,
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        IPC_MAIN_CHANNELS.PERMISSION_UPDATED,
        handlePermissionUpdate,
      );
    };
  }, [origin]);

  const handlePermissionToggle = async (type: string, state: string) => {
    try {
      await window.electron.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.UPDATE_SITE_PERMISSION,
        {
          origin,
          type,
          state,
        },
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update permission:', error);
    }
  };

  const handleClearAllPermissions = async () => {
    try {
      await window.electron.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.CLEAR_SITE_PERMISSIONS,
        origin,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear permissions:', error);
    }
  };

  const hasActivePermissions = sitePermissions.some(
    (p) =>
      p.state === PERMISSION_STATES.GRANTED ||
      p.state === PERMISSION_STATES.DENIED,
  );

  if (!isVisible) return null;

  if (!origin || origin === 'Local File' || origin === 'Invalid URL') {
    return (
      <div
        ref={dropdownRef}
        className="w-80 rounded-md bg-white p-4 shadow-lg ring-1 ring-slate-500 !ring-opacity-40 dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40"
      >
        <div className="flex items-center gap-2 text-gray-500">
          <Icon icon="mdi:shield-lock" />
          <span className="text-sm">
            Site permissions not available for this page
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="w-80 rounded-md bg-white shadow-lg ring-1 ring-slate-500 !ring-opacity-40 dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:shield-lock" className="text-lg" />
            <span className="text-sm font-medium">Site Permissions</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <Icon icon="mdi:close" className="text-sm" />
          </button>
        </div>
        <div className="mt-1 truncate text-xs text-gray-500" title={origin}>
          {origin.replace(/^https?:\/\//, '')}
        </div>
      </div>

      {/* Refresh Notification */}
      {showRefreshNotification && (
        <div className="mx-4 mt-3 mb-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-700 dark:bg-blue-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Icon
                icon={isRefreshing ? 'mdi:loading' : 'mdi:information'}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              <span className="text-xs">
                {isRefreshing
                  ? 'Refreshing page...'
                  : 'Permission updated. Refresh to apply changes.'}
              </span>
            </div>
            {!isRefreshing && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={refreshPage}
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowRefreshNotification(false)}
                  className="rounded bg-gray-500 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions List */}
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Permissions for this site
          </span>
          {hasActivePermissions && (
            <button
              type="button"
              onClick={handleClearAllPermissions}
              className="text-xs text-red-600 hover:underline dark:text-red-400"
              title="Reset all permissions to default"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {sitePermissions.map((permission) => (
            <PermissionToggle
              key={permission.type}
              permission={permission}
              onToggle={handlePermissionToggle}
            />
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Changes take effect immediately. Reload the page if needed.
        </div>
      </div>
    </div>
  );
}

export default SitePermissionsDropdown;
