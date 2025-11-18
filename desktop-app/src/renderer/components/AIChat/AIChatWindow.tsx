import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addMessage,
  selectChatMessages,
  selectHasApiKey,
  setApiKey,
} from '../../store/features/aiChat';
import { IPC_MAIN_CHANNELS } from '../../../common/constants';
import APIKeyModal from '../APIKeyModal';

type AIChatWindowProps = {
  onClose: () => void;
};

const AIChatWindow: React.FC<AIChatWindowProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const hasApiKey = useSelector(selectHasApiKey);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setApiModalOpen] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user' as const,
      };
      dispatch(addMessage(userMessage));
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await window.electron.ipcRenderer.invoke<
          string,
          string
        >(IPC_MAIN_CHANNELS['ai-chat:sendMessage'], inputValue);

        const aiMessage = {
          id: Date.now().toString(),
          text: response,
          sender: 'ai' as const,
        };
        dispatch(addMessage(aiMessage));
      } catch (error) {
        console.error('Error sending message to AI:', error);
        const errorMessage = {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error.',
          sender: 'ai' as const,
        };
        dispatch(addMessage(errorMessage));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveApiKey = (apiKey: string) => {
    dispatch(setApiKey(apiKey));
    window.electron.store.set('geminiApiKey', apiKey);
  };

  return (
    <>
      <div className="fixed bottom-20 right-5 flex h-[400px] w-96 flex-col rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-100 p-4">
          <h3 className="text-lg font-bold">AI Chat</h3>
          <button
            type="button"
            onClick={() => setApiModalOpen(true)}
            className="text-xs text-blue-500 hover:underline"
          >
            Set API Key
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`my-2 rounded-lg p-2 ${
                message.sender === 'user'
                  ? 'self-end bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="my-2 rounded-lg bg-gray-200 p-2">...</div>
          )}
        </div>
        <div className="flex rounded-b-lg bg-gray-100 p-4">
          {hasApiKey ? (
            <>
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full rounded-lg border p-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="ml-2 rounded-lg bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                Send
              </button>
            </>
          ) : (
            <div className="w-full text-center">
              Please set your API key to use the chat.
            </div>
          )}
        </div>
      </div>
      <APIKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onSave={handleSaveApiKey}
      />
    </>
  );
};

export default AIChatWindow;
