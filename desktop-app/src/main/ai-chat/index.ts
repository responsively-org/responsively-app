import { GoogleGenerativeAI } from '@google/generative-ai';
import { ipcMain } from 'electron';
import store from '../../store';

let genAI: GoogleGenerativeAI | null = null;

const initializeGenAI = () => {
  const apiKey = store.get('geminiApiKey') as string | undefined;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  } else {
    genAI = null;
  }
};

export const initAIChat = () => {
  initializeGenAI();

  store.onDidChange('geminiApiKey', () => {
    initializeGenAI();
  });

  ipcMain.handle('ai-chat:sendMessage', async (_, message: string) => {
    if (!genAI) {
      return 'API key is not set. Please set it in the chat settings.';
    }
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Error communicating with AI:', error);
      return 'Sorry, I encountered an error.';
    }
  });
};
