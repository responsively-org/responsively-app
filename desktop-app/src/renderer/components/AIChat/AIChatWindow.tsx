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
  clearMessages,
  setSelectedModel,
  setCustomSystemPrompt,
  selectSelectedModel,
  selectCustomSystemPrompt,
  setPreferredLanguage,
  selectPreferredLanguage,
} from '../../store/features/aiChat';
import { selectAddress, selectPageTitle } from '../../store/features/renderer';
import { selectDevices } from '../../store/features/device-manager';
import { IPC_MAIN_CHANNELS, AI_CHAT_EVENTS } from '../../../common/constants';
import { webViewPubSub } from '../../lib/pubsub';
import SettingsModal from '../SettingsModal';

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
  const selectedModel = useSelector(selectSelectedModel);
  const customSystemPrompt = useSelector(selectCustomSystemPrompt);
  const preferredLanguage = useSelector(selectPreferredLanguage);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setApiModalOpen] = useState(false);
  const [isContextEnabled, setIsContextEnabled] = useState(true);

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

  const fetchPageSource = async (): Promise<string> => {
    try {
      const results = await Promise.race([
        webViewPubSub.publish(AI_CHAT_EVENTS.GET_PAGE_SOURCE),
        new Promise<any[]>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);
      return results.find((r) => r.result)?.result || '';
    } catch (error) {
      console.error('Failed to fetch page source:', error);
      return '';
    }
  };

  const fetchScreenshot = async (): Promise<string | null> => {
    try {
      return await window.electron.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS['ai-chat:get-app-screenshot']
      );
    } catch (error) {
      console.error('Failed to fetch screenshot:', error);
      return null;
    }
  };

  const [attachedScreenshot, setAttachedScreenshot] = useState<string | null>(
    null
  );

  const handleCaptureScreenshot = async () => {
    const screenshot = await fetchScreenshot();
    if (screenshot) {
      setAttachedScreenshot(screenshot);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      try {
        let sourceCode = '';

        const promises = [];
        if (isContextEnabled) {
          promises.push(
            fetchPageSource().then((res) => {
              sourceCode = res;
              return undefined;
            })
          );
        }

        await Promise.all(promises);

        const userMessage = {
          id: Date.now().toString(),
          text: inputValue,
          sender: 'user' as const,
          image: attachedScreenshot || undefined,
        };
        dispatch(addMessage(userMessage));
        setInputValue('');
        setAttachedScreenshot(null);
        setIsLoading(true);

        const context = {
          url: address,
          pageTitle,
          devices: devices.map((d) => ({
            name: d.name,
            width: d.width,
            height: d.height,
          })),
          sourceCode,
          screenshot: attachedScreenshot || undefined,
          selectedModel,
          customSystemPrompt,
          preferredLanguage,
        };

        const response = await window.electron.ipcRenderer.invoke<string>(
          IPC_MAIN_CHANNELS['ai-chat:sendMessage'],
          {
            message: inputValue,
            context,
          }
        );

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

  const handleSaveSettings = (settings: {
    apiKey: string;
    model: string;
    customPrompt: string;
    preferredLanguage: string;
  }) => {
    if (settings.apiKey) {
      dispatch(setApiKey(settings.apiKey));
      window.electron.store.set('geminiApiKey', settings.apiKey);
    }
    dispatch(setSelectedModel(settings.model));
    dispatch(setCustomSystemPrompt(settings.customPrompt));
    dispatch(setPreferredLanguage(settings.preferredLanguage));
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
                onClick={() => setIsContextEnabled(!isContextEnabled)}
                className={`text-xs ${
                  isContextEnabled
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                title={
                  isContextEnabled
                    ? 'Page context enabled'
                    : 'Page context disabled'
                }
              >
                <Icon
                  icon={isContextEnabled ? 'lucide:eye' : 'lucide:eye-off'}
                  width={16}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to clear the chat history?'
                    )
                  ) {
                    dispatch(clearMessages());
                  }
                }}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                title="Clear Chat"
              >
                <Icon icon="lucide:trash-2" width={14} />
              </button>
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

                {/* Message Content */}
                <div className="flex max-w-[85%] flex-col gap-2">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Screenshot"
                      className={`max-h-60 w-auto rounded-lg border object-contain shadow-sm ${
                        message.sender === 'user'
                          ? 'self-end border-blue-400 bg-blue-600'
                          : 'self-start border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    />
                  )}
                  {message.text && (
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'prose prose-sm max-w-none bg-white dark:bg-gray-800 dark:prose-invert dark:text-gray-200'
                      }`}
                    >
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  )}
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
            {attachedScreenshot && (
              <div className="mb-2 flex items-center gap-2">
                <div className="relative">
                  <img
                    src={attachedScreenshot}
                    alt="Attached Screenshot"
                    className="h-16 w-auto rounded border border-gray-300 object-contain dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedScreenshot(null)}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                  >
                    <Icon icon="lucide:x" width={10} />
                  </button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Screenshot attached
                </span>
              </div>
            )}
            {hasApiKey ? (
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleCaptureScreenshot}
                  disabled={isLoading || !!attachedScreenshot}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    attachedScreenshot
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                  }`}
                  title="Attach Screenshot"
                >
                  <Icon icon="lucide:camera" width={18} />
                </button>
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
      <SettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
};

export default AIChatWindow;
