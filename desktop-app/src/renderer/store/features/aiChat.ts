import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  image?: string;
};

type AIChatState = {
  isOpen: boolean;
  messages: Message[];
  hasApiKey: boolean;
  apiKey: string | null;
  selectedModel: string;
  customSystemPrompt: string;
  preferredLanguage: string;
};

const initialState: AIChatState = {
  isOpen: false,
  messages: window.electron.store.get('aiChat.messages') || [],
  hasApiKey: false,
  apiKey: null,
  selectedModel:
    window.electron.store.get('aiChat.selectedModel') || 'gemini-2.5-flash',
  customSystemPrompt:
    window.electron.store.get('aiChat.customSystemPrompt') || '',
  preferredLanguage:
    window.electron.store.get('aiChat.preferredLanguage') || 'English',
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      window.electron.store.set('aiChat.messages', current(state.messages));
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
      state.hasApiKey = !!action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      window.electron.store.set('aiChat.messages', []);
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
      window.electron.store.set('aiChat.selectedModel', action.payload);
    },
    setCustomSystemPrompt: (state, action: PayloadAction<string>) => {
      state.customSystemPrompt = action.payload;
      window.electron.store.set('aiChat.customSystemPrompt', action.payload);
    },
    setPreferredLanguage: (state, action: PayloadAction<string>) => {
      state.preferredLanguage = action.payload;
      window.electron.store.set('aiChat.preferredLanguage', action.payload);
    },
  },
});

// store/index.ts와의 의존성이 사라져 순환 참조 오류가 해결하기위한 타입 정의
type RootStateWithAIChat = {
  aiChat: AIChatState;
};

export const {
  toggleChat,
  addMessage,
  setApiKey,
  clearMessages,
  setSelectedModel,
  setCustomSystemPrompt,
  setPreferredLanguage,
} = aiChatSlice.actions;

export const selectIsChatOpen = (state: RootState) => state.aiChat.isOpen;
export const selectChatMessages = (state: RootState) => state.aiChat.messages;
export const selectHasApiKey = (state: RootState) => state.aiChat.hasApiKey;
export const selectSelectedModel = (state: RootState) =>
  state.aiChat.selectedModel;
export const selectCustomSystemPrompt = (state: RootState) =>
  state.aiChat.customSystemPrompt;
export const selectPreferredLanguage = (state: RootState) =>
  state.aiChat.preferredLanguage;

export default aiChatSlice.reducer;
