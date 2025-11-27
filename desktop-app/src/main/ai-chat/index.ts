import { GoogleGenerativeAI } from '@google/generative-ai';
import { ipcMain, BrowserWindow } from 'electron';
import store from '../../store';
import { APP_KNOWLEDGE } from './appKnowledge';
import { optimizeHtml } from './htmlOptimizer';

// Valid Gemini models
const VALID_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-3-pro-preview',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];
const DEFAULT_MODEL = 'gemini-2.5-flash';

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
          selectedModel?: string;
          customSystemPrompt?: string;
          preferredLanguage?: string;
        };
      }
    ) => {
      if (!genAI) {
        return 'API key is not set. Please set it in the chat settings.';
      }
      try {
        const { message, context } = payload;

        // Validate and sanitize model name
        const requestedModel = context.selectedModel || DEFAULT_MODEL;
        const selectedModelName = VALID_MODELS.includes(requestedModel)
          ? requestedModel
          : DEFAULT_MODEL;

        // Log warning if model was changed
        if (selectedModelName !== requestedModel) {
          console.warn(
            `Invalid model "${requestedModel}" requested. Falling back to "${DEFAULT_MODEL}".`
          );
        }

        // Log for debugging
        console.log('AI Chat Request:', {
          requestedModel,
          selectedModel: selectedModelName,
          hasCustomPrompt: !!context.customSystemPrompt,
          hasScreenshot: !!context.screenshot,
        });

        const model = genAI.getGenerativeModel({
          model: selectedModelName,
        });

        const optimizedSource = context.sourceCode
          ? optimizeHtml(context.sourceCode)
          : 'Not available';

        const basePrompt = context.customSystemPrompt
          ? `${context.customSystemPrompt}\n\n`
          : '';

        const languageInstruction = context.preferredLanguage
          ? `\nIMPORTANT: Respond in ${context.preferredLanguage}. All your answers must be written in ${context.preferredLanguage}.\n\n`
          : '';

        const systemPrompt = `${basePrompt}${languageInstruction}You are an intelligent assistant for Responsively App, a browser for responsive web development.

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

        // Return specific error messages based on error type
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();

          // API key errors
          if (
            errorMsg.includes('api key') ||
            errorMsg.includes('api_key') ||
            errorMsg.includes('invalid key') ||
            errorMsg.includes('unauthorized')
          ) {
            return 'API key is invalid or missing. Please check your settings and ensure you have a valid Gemini API key.';
          }

          // Quota/billing errors
          if (
            errorMsg.includes('quota') ||
            errorMsg.includes('limit') ||
            errorMsg.includes('rate limit') ||
            errorMsg.includes('billing')
          ) {
            return 'API quota exceeded or billing issue. Please check your Google Cloud Console for usage limits and billing status.';
          }

          // Model errors
          if (
            errorMsg.includes('model') ||
            errorMsg.includes('not found') ||
            errorMsg.includes('does not exist')
          ) {
            return `Model "${context.selectedModel}" is not available. Please try selecting a different model in Settings.`;
          }

          // Network errors
          if (
            errorMsg.includes('network') ||
            errorMsg.includes('fetch') ||
            errorMsg.includes('timeout') ||
            errorMsg.includes('econnrefused')
          ) {
            return 'Network error. Please check your internet connection and try again.';
          }

          // Generic error with message
          return `Sorry, I encountered an error: ${error.message}`;
        }

        return 'Sorry, I encountered an unexpected error. Please try again.';
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
