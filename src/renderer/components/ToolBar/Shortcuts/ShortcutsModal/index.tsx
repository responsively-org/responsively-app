import { SHORTCUT_KEYS } from 'renderer/components/KeyboardShortcutsManager/constants';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import ShortcutName from './ShortcutName';
import ShortcutButton from './ShortcutButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const shortcutsList = [
  {
    id: 0,
    name: 'General Shortcuts',
    shortcuts: Object.entries(SHORTCUT_KEYS).splice(0, 7),
  },
  {
    id: 1,
    name: 'Previewer Shorcuts',
    shortcuts: Object.entries(SHORTCUT_KEYS).splice(7),
  },
];

const ShortcutsModal = ({ isOpen, onClose }: Props) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex w-[380px] flex-col gap-4 px-2">
          {Object.values(shortcutsList).map((category) => (
            <div key={category.id}>
              <h3 className="mb-3 border-b border-slate-600 pb-1 text-lg">
                {category.name}
              </h3>
              {category.shortcuts.map((value) => (
                <div className="my-2.5 flex justify-between" key={value[0]}>
                  <ShortcutName text={value[0]} />
                  <ShortcutButton text={value[1]} />
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
