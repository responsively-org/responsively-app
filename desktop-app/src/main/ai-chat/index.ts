import { GoogleGenerativeAI } from '@google/generative-ai';
import { ipcMain, BrowserWindow } from 'electron';
import store from '../../store';
import { APP_KNOWLEDGE } from './appKnowledge';
import { optimizeHtml } from './htmlOptimizer';

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
          screenshot?: string;
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

        const optimizedSource = context.sourceCode
          ? optimizeHtml(context.sourceCode)
          : 'Not available';

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

Page Source (HTML - Optimized):
\`\`\`html
${optimizedSource.substring(0, 50000)}
\`\`\`
(Note: Source code is optimized and may be truncated if too long)

User Message: ${message}

IMPORTANT: You are provided with a screenshot of the current page or app window. 
Use this image to answer questions about the visual layout, design, and content. 
If the user asks "what do you see?" or "how does this look?", refer to the provided screenshot.
`;

        const parts: any[] = [systemPrompt];

        if (context.screenshot) {
          // Remove the data URL prefix (e.g., "data:image/png;base64,")
          const base64Data = context.screenshot.split(',')[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        return text;
      } catch (error) {
        console.error('Error communicating with AI:', error);
        return 'Sorry, I encountered an error.';
      }
    }
  );

  ipcMain.handle('ai-chat:get-app-screenshot', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;
    try {
      const image = await win.capturePage();
      return image.toDataURL();
    } catch (error) {
      console.error('Error capturing app screenshot:', error);
      return null;
    }
  });
};
