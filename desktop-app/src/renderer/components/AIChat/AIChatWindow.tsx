import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Resizable } from 're-resizable';
import { Icon } from '@iconify/react';
import {
  addMessage,
  selectChatMessages,
  selectHasApiKey,
  setApiKey,
} from '../../store/features/aiChat';
import { selectAddress, selectPageTitle } from '../../store/features/renderer';
import { selectDevices } from '../../store/features/device-manager';
import { IPC_MAIN_CHANNELS } from '../../../common/constants';
import APIKeyModal from '../APIKeyModal';

type AIChatWindowProps = {
  onClose: () => void;
};

const AIChatWindow: React.FC<AIChatWindowProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const hasApiKey = useSelector(selectHasApiKey);
  const address = useSelector(selectAddress);
  const pageTitle = useSelector(selectPageTitle);
  const devices = useSelector(selectDevices);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setApiModalOpen] = useState(false);

  // Window State
  const [position, setPosition] = useState({
    x: window.innerWidth - 420,
    y: window.innerHeight - 500,
  });
  const [size, setSize] = useState({ width: 400, height: 500 });

  // Refs to hold latest state for event handlers
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [inputValue]);

  // Dragging Logic

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - positionRef.current.x,
      startY: e.clientY - positionRef.current.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = () => {
    resizeStartRef.current = {
      x: positionRef.current.x,
      y: positionRef.current.y,
      width: sizeRef.current.width,
      height: sizeRef.current.height,
    };
  };

  const handleResize = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    d: { width: number; height: number }
  ) => {
    // Calculate proposed size
    let newWidth = resizeStartRef.current.width + d.width;
    let newHeight = resizeStartRef.current.height + d.height;

    // Apply constraints (matching Resizable props)
    newWidth = Math.max(300, newWidth);
    newHeight = Math.max(400, newHeight);

    // Calculate actual delta applied
    const deltaWidth = newWidth - resizeStartRef.current.width;
    const deltaHeight = newHeight - resizeStartRef.current.height;

    let newX = resizeStartRef.current.x;
    let newY = resizeStartRef.current.y;

    // Check direction case-insensitively just in case, though re-resizable uses camelCase
    const dir = direction.toLowerCase();

    if (dir.includes('left')) {
      newX -= deltaWidth;
    }
    if (dir.includes('top')) {
      newY -= deltaHeight;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user' as const,
      };
      dispatch(addMessage(userMessage));
      setInputValue('');
      setIsLoading(true);

      try {
        // Fetch page source from the primary device
        let sourceCode = '';
        try {
          const results = await import('../../lib/pubsub').then(
            ({ webViewPubSub }) =>
              webViewPubSub.publish(
                import('../../../common/constants').then(
                  (m) => m.AI_CHAT_EVENTS.GET_PAGE_SOURCE
                ) as any
              )
          );

          // Re-fetch correctly to avoid issues
          const sourceCodeResults = await import('../../lib/pubsub').then(
            async ({ webViewPubSub }) => {
              const { AI_CHAT_EVENTS } = await import(
                '../../../common/constants'
              );
              return webViewPubSub.publish(AI_CHAT_EVENTS.GET_PAGE_SOURCE);
            }
          );
          sourceCode = sourceCodeResults.find((r) => r.result)?.result || '';
        } catch (e) {
          console.error('Failed to fetch source code', e);
        }

        const context = {
          url: address,
          pageTitle,
          devices: devices.map((d) => ({
            name: d.name,
            width: d.width,
            height: d.height,
          })),
          sourceCode,
        };

        const response = await window.electron.ipcRenderer.invoke<
          string,
          { message: string; context: any }
        >(IPC_MAIN_CHANNELS['ai-chat:sendMessage'], {
          message: inputValue,
          context,
        });

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
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 50,
        }}
      >
        <Resizable
          size={size}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          minWidth={300}
          minHeight={400}
          className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {/* Header */}
          <div
            className="flex cursor-move items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700"
            role="button"
            tabIndex={0}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Icon icon="logos:google-gemini" width={20} />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                AI Chat
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setApiModalOpen(true)}
                className="text-xs text-blue-500 hover:underline dark:text-blue-400"
                title="Settings"
              >
                <Icon icon="lucide:settings" width={14} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <Icon icon="lucide:x" width={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    message.sender === 'user'
                      ? 'border-blue-600 bg-blue-500'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  <Icon
                    icon={
                      message.sender === 'user'
                        ? 'lucide:user'
                        : 'logos:google-gemini'
                    }
                    className={message.sender === 'user' ? 'text-white' : ''}
                    width={16}
                  />
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'prose prose-sm max-w-none bg-white dark:bg-gray-800 dark:prose-invert dark:text-gray-200'
                  }`}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-400 bg-white">
                  <Icon icon="logos:google-gemini" width={16} />
                </div>
                <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="rounded-b-lg border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            {hasApiKey ? (
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Ask anything about the page or app..."
                  className="max-h-32 min-h-[40px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <Icon icon="lucide:send" width={18} />
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Please set your API key to start chatting.
              </div>
            )}
          </div>
        </Resizable>
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
