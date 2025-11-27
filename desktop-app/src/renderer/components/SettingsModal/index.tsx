import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../Modal';
import Button from '../Button';
import Input from '../Input';
import {
  selectSelectedModel,
  selectCustomSystemPrompt,
  selectPreferredLanguage,
} from '../../store/features/aiChat';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    apiKey: string;
    model: string;
    customPrompt: string;
    preferredLanguage: string;
  }) => void;
};

const MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Balanced)' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (Fast)' },
  {
    value: 'gemini-3-pro-preview',
    label: 'gemini-3-pro-preview (Experimental)',
  },
];

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Korean', label: '한국어 (Korean)' },
  { value: 'Japanese', label: '日本語 (Japanese)' },
  { value: 'Chinese', label: '中文 (Chinese)' },
  { value: 'Spanish', label: 'Español (Spanish)' },
  { value: 'French', label: 'Français (French)' },
  { value: 'German', label: 'Deutsch (German)' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const currentModel = useSelector(selectSelectedModel);
  const currentPrompt = useSelector(selectCustomSystemPrompt);
  const currentLanguage = useSelector(selectPreferredLanguage);

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(currentModel);
  const [customPrompt, setCustomPrompt] = useState(currentPrompt);
  const [preferredLanguage, setPreferredLanguage] = useState(currentLanguage);

  useEffect(() => {
    setModel(currentModel);
    setCustomPrompt(currentPrompt);
    setPreferredLanguage(currentLanguage);
  }, [currentModel, currentPrompt, currentLanguage, isOpen]);

  const handleSave = () => {
    onSave({ apiKey, model, customPrompt, preferredLanguage });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Chat Settings">
      <div className="flex flex-col gap-4 pt-4">
        <div>
          <Input
            label="Gemini API Key"
            type="password"
            placeholder="Your Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="model-select"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            AI Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="language-select"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Response Language
          </label>
          <select
            id="language-select"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="custom-prompt-textarea"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Custom System Prompt (Optional)
          </label>
          <textarea
            id="custom-prompt-textarea"
            placeholder="e.g., 'Be very concise'"
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This will be added to the AI&apos;s instructions
          </p>
        </div>

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

export default SettingsModal;
