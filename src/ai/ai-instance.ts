import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // Ensure API key is read from environment
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Ensure model is gemini-2.0-flash
});
