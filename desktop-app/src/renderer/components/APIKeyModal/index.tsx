import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Input from '../Input';

type APIKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
};

const APIKeyModal: React.FC<APIKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter your API Key">
      <div className="flex flex-col gap-4 pt-4">
        <Input
          type="password"
          placeholder="Your Gemini API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button isPrimary onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default APIKeyModal;
