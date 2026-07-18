import {useSelector} from 'react-redux';
import {
  SHORTCUT_CATEGORIES,
  SHORTCUT_KEYS,
} from 'renderer/components/KeyboardShortcutsManager/constants';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import {selectResolvedShortcutBindings} from 'renderer/store/features/shortcuts';
import ShortcutName from './ShortcutName';
import ShortcutButton from './ShortcutButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal = ({isOpen, onClose}: Props) => {
  const shortcutBindings = useSelector(selectResolvedShortcutBindings);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex w-[520px] flex-col gap-4 px-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            In-app shortcuts can be customized here. Reload stays fixed for now because it is still
            handled by the application menu accelerator.
          </p>
          {SHORTCUT_CATEGORIES.map((category) => (
            <div key={category.id}>
              <h3 className="mb-3 border-b border-slate-600 pb-1 text-lg">{category.name}</h3>
              {category.channels.map((channel) => (
                <div className="my-2.5 flex items-center justify-between gap-4" key={channel}>
                  <ShortcutName text={channel} />
                  <ShortcutButton
                    channel={channel}
                    text={shortcutBindings[channel] ?? SHORTCUT_KEYS[channel]}
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="mb-2 flex flex-row justify-end gap-2">
            <Button className="px-2" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShortcutsModal;
