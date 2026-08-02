import {Icon} from '@iconify/react';
import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  closeFindBar,
  selectFindTextActiveMatch,
  selectFindTextIsOpen,
  selectFindTextMatches,
  selectFindTextSearchText,
  setSearchText,
} from 'renderer/store/features/find-text';
import {webViewPubSub} from 'renderer/lib/pubsub';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from '../KeyboardShortcutsManager/useKeyboardShortcut';

export const FIND_BAR_EVENTS = {
  FIND_NEXT: 'FIND_NEXT',
  FIND_PREVIOUS: 'FIND_PREVIOUS',
} as const;

const FindBar = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectFindTextIsOpen);
  const searchText = useSelector(selectFindTextSearchText);
  const matches = useSelector(selectFindTextMatches);
  const activeMatch = useSelector(selectFindTextActiveMatch);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when the bar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the animation has started and the element is visible
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isOpen]);

  // Listen for IPC toggle from main process menu
  useEffect(() => {
    const handler = () => {
      if (isOpen) {
        // If already open, just re-focus
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    const removeListener = window.electron.ipcRenderer.on('toggle-find-bar', handler);
    return () => {
      removeListener?.();
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    dispatch(closeFindBar());
  }, [dispatch]);

  // Global Escape key handler — close find bar even when input is not focused
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);

    // Also listen for Escape forwarded from webview guests via main process
    const removeIpcListener = window.electron.ipcRenderer.on('close-find-bar', handleClose);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      removeIpcListener?.();
    };
  }, [isOpen, handleClose]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchText(e.target.value));
    },
    [dispatch]
  );

  const handleFindNext = useCallback(() => {
    webViewPubSub.publish(FIND_BAR_EVENTS.FIND_NEXT);
  }, []);

  const handleFindPrevious = useCallback(() => {
    webViewPubSub.publish(FIND_BAR_EVENTS.FIND_PREVIOUS);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleFindPrevious();
        } else {
          handleFindNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose, handleFindNext, handleFindPrevious]
  );

  // Register keyboard shortcut to open the find bar
  // The shortcut handler in the toolbar will dispatch openFindBar,
  // but we also handle it here for re-focus when already open
  useKeyboardShortcut(
    SHORTCUT_CHANNEL.FIND_TEXT,
    useCallback(() => {
      if (isOpen) {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }, [isOpen])
  );

  const matchInfo =
    searchText.length > 0 ? (
      <span className="whitespace-nowrap text-xs text-gray-400">
        {matches > 0 ? `${activeMatch} of ${matches}` : 'No results'}
      </span>
    ) : null;

  return (
    <div
      className={`absolute right-4 top-1 z-50 transition-all duration-200 ease-in-out ${
        isOpen
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        {/* Search input */}
        <div className="flex items-center gap-2">
          <Icon
            icon="lucide:search"
            className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500"
          />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Find in page…"
            className="w-44 border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
            spellCheck={false}
          />
        </div>

        {/* Match count */}
        {matchInfo}

        {/* Separator */}
        <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-600" />

        {/* Navigation buttons */}
        <button
          type="button"
          onClick={handleFindPrevious}
          disabled={matches === 0}
          className="rounded p-0.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          title="Previous match (Shift+Enter)"
        >
          <Icon icon="lucide:chevron-up" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleFindNext}
          disabled={matches === 0}
          className="rounded p-0.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          title="Next match (Enter)"
        >
          <Icon icon="lucide:chevron-down" className="h-4 w-4" />
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="rounded p-0.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          title="Close (Escape)"
        >
          <Icon icon="lucide:x" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FindBar;
