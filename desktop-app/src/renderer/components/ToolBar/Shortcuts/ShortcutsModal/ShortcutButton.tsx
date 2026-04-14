import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Button from 'renderer/components/Button';
import {
  CUSTOMIZABLE_SHORTCUT_CHANNELS,
  ShortcutChannel,
} from 'renderer/components/KeyboardShortcutsManager/constants';
import {
  clearShortcutOverride,
  selectShortcutOverride,
  setShortcutOverride,
} from 'renderer/store/features/shortcuts';

interface Props {
  channel: ShortcutChannel;
  text: string[];
}

const SPECIAL_CODE_MAP: {[key: string]: string} = {
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  Backspace: 'backspace',
  Comma: ',',
  Delete: 'del',
  Equal: '=',
  Minus: '-',
  Period: '.',
  Slash: '/',
  Space: 'space',
};

const formatText = (value: string) => {
  if (value === 'mod') {
    if (navigator?.userAgent?.includes('Windows')) {
      return 'Ctrl';
    }
    return '⌘';
  }

  if (value === 'alt') return 'Alt';
  if (value === 'shift') return 'Shift';
  if (value === 'del') return 'Del';
  if (value === 'backspace') return 'Backspace';
  if (value.length === 1) return value.toUpperCase();
  return value;
};

const ShortcutPreview = ({shortcut}: {shortcut: string}) => {
  const btnText = shortcut.split('+');
  const btnTextLength = btnText.length - 1;

  return (
    <span className="inline-flex items-center">
      {btnText.map((value, index) => (
        <span key={`${shortcut}-${value}-${index}`}>
          <span className="rounded border border-gray-200 bg-gray-100 px-[6px] py-[2px] text-xs font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100">
            {formatText(value)}
          </span>
          {index < btnTextLength && <span className="px-1">+</span>}
        </span>
      ))}
    </span>
  );
};

const normalizeShortcutFromEvent = (event: React.KeyboardEvent<HTMLButtonElement>) => {
  const segments = [];

  if (event.ctrlKey || event.metaKey) {
    segments.push('mod');
  }
  if (event.altKey) {
    segments.push('alt');
  }
  if (event.shiftKey) {
    segments.push('shift');
  }

  let key = SPECIAL_CODE_MAP[event.code];
  if (!key && event.code.startsWith('Key')) {
    key = event.code.slice(3).toLowerCase();
  }
  if (!key && event.code.startsWith('Digit')) {
    key = event.code.slice(5);
  }

  if (!key) {
    const normalizedKey = event.key.toLowerCase();
    if (['control', 'meta', 'alt', 'shift'].includes(normalizedKey)) {
      return null;
    }
    key = normalizedKey;
  }

  return [...segments, key].join('+');
};

const ShortcutButton = ({channel, text}: Props) => {
  const dispatch = useDispatch();
  const shortcutOverride = useSelector(selectShortcutOverride(channel));
  const isCustomizable = CUSTOMIZABLE_SHORTCUT_CHANNELS.includes(channel);
  const isOverridden = shortcutOverride != null;
  const [isCapturing, setIsCapturing] = useState(false);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isCapturing) {
      captureButtonRef.current?.focus();
    }
  }, [isCapturing]);

  const handleStartCapture = () => {
    if (!isCustomizable) {
      return;
    }
    setIsCapturing(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      setIsCapturing(false);
      return;
    }

    const shortcut = normalizeShortcutFromEvent(event);
    if (!shortcut) {
      return;
    }

    dispatch(
      setShortcutOverride({
        channel,
        keys: [shortcut],
      })
    );
    setIsCapturing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isCapturing ? (
        <button
          ref={captureButtonRef}
          type="button"
          onKeyDown={handleKeyDown}
          data-testid={`shortcut-${channel}-capture`}
          className="rounded border border-emerald-500 bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900 focus:outline-none dark:bg-emerald-900/30 dark:text-emerald-100"
        >
          Press shortcut
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          {text.map((shortcut, index) => (
            <span key={`${channel}-${shortcut}-${index}`}>
              <ShortcutPreview shortcut={shortcut} />
              {index < text.length - 1 ? (
                <span className="px-1 text-xs text-slate-500 dark:text-slate-300">/</span>
              ) : null}
            </span>
          ))}
        </div>
      )}

      {isCustomizable ? (
        <div className="flex items-center gap-1">
          {isCapturing ? (
            <Button className="px-2 text-xs" isTextButton onClick={() => setIsCapturing(false)}>
              Cancel
            </Button>
          ) : (
            <Button
              className="px-2 text-xs"
              isTextButton
              onClick={handleStartCapture}
              data-testid={`shortcut-${channel}-edit`}
            >
              {isOverridden ? 'Change' : 'Edit'}
            </Button>
          )}
          {isOverridden && !isCapturing ? (
            <Button
              className="px-2 text-xs"
              isTextButton
              onClick={() => dispatch(clearShortcutOverride(channel))}
              data-testid={`shortcut-${channel}-reset`}
            >
              Reset
            </Button>
          ) : null}
        </div>
      ) : (
        <span className="text-xs text-slate-500 dark:text-slate-300">Fixed</span>
      )}
    </div>
  );
};

export default ShortcutButton;
