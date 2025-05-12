import OpenAI from 'openai';

export function getOpenAIClient(): any {
  throw new Error('OpenAI integration is temporarily disabled.');
  // const apiKey = process.env.OPENAI_API_KEY || 'sk-test-key';
  // if (!apiKey) {
  //   throw new Error('OPENAI_API_KEY environment variable is not set');
  // }
  // return new OpenAI({
  //   apiKey,
  // });
}
 