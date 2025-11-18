import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

type AIChatState = {
  isOpen: boolean;
  messages: Message[];
  hasApiKey: boolean;
  apiKey: string | null;
};

const initialState: AIChatState = {
  isOpen: false,
  messages: [],
  hasApiKey: false,
  apiKey: null,
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
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
      state.hasApiKey = !!action.payload;
    },
  },
});

// store/index.ts와의 의존성이 사라져 순환 참조 오류가 해결하기위한 타입 정의
type RootStateWithAIChat = {
  aiChat: AIChatState;
};

export const { toggleChat, addMessage, setApiKey } = aiChatSlice.actions;

export const selectIsChatOpen = (state: RootState) => state.aiChat.isOpen;
export const selectChatMessages = (state: RootState) => state.aiChat.messages;
export const selectHasApiKey = (state: RootState) => state.aiChat.hasApiKey;

export default aiChatSlice.reducer;
