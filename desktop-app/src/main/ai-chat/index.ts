import { GoogleGenerativeAI } from '@google/generative-ai';
import { ipcMain } from 'electron';
import store from '../../store';
import { APP_KNOWLEDGE } from './appKnowledge';

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

  ipcMain.handle(
    'ai-chat:sendMessage',
    async (
      _,
      payload: {
        message: string;
        context: {
          url: string;
          pageTitle: string;
          devices: { name: string; width: number; height: number }[];
          sourceCode?: string;
        };
      }
    ) => {
      if (!genAI) {
        return 'API key is not set. Please set it in the chat settings.';
      }
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-lite',
        });

        const { message, context } = payload;

        const systemPrompt = `
You are an intelligent assistant for Responsively App, a browser for responsive web development.

About Responsively App:
${APP_KNOWLEDGE}

Current Context:
- URL: ${context.url}
- Page Title: ${context.pageTitle}
- Active Devices: ${context.devices
          .map((d) => `${d.name} (${d.width}x${d.height})`)
          .join(', ')}

Page Source (HTML):
\`\`\`html
${context.sourceCode ? context.sourceCode.substring(0, 20000) : 'Not available'}
\`\`\`
(Note: Source code may be truncated if too long)

User Message: ${message}
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        return text;
      } catch (error) {
        console.error('Error communicating with AI:', error);
        return 'Sorry, I encountered an error.';
      }
    }
  );
};
