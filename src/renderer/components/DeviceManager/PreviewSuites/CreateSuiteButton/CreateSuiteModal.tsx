import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addSuite } from 'renderer/store/features/device-manager';

import Button from '../../../Button';
import Input from '../../../Input';
import Modal from '../../../Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSuiteModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState<string>('');
  const dispatch = useDispatch();

  const handleAddSuite = async (): Promise<void> => {
    if (name === '') {
      // eslint-disable-next-line no-alert
      return alert(
        'Suite name cannot be empty. Please enter a name for the suite.'
      );
    }
    dispatch(addSuite({ id: uuidv4(), name, devices: ['10008'] }));
    return onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Add Suite">
        <div className="flex flex-col gap-4">
          <div className="flex w-[420px] flex-col gap-2">
            <Input
              label="Suite Name"
              type="text"
              placeholder="My Custom Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row justify-end gap-2">
              <Button className="px-2" onClick={onClose}>
                Cancel
              </Button>
              <Button className="px-2" onClick={handleAddSuite} isActive>
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
