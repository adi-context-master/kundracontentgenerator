/**
 * Claude API Client for Next.js
 *
 * This module handles all communication with the Anthropic Claude API.
 * It uses the official Anthropic Node SDK.
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with API key from environment
const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  return new Anthropic({ apiKey });
};

/**
 * Call Claude API with a prompt and return the response text.
 *
 * @param systemPrompt - System instructions for Claude
 * @param userPrompt - The user's prompt/request
 * @param model - Claude model to use (default: claude-sonnet-4-5-20250929)
 * @param maxTokens - Maximum tokens to generate (default: 8000)
 * @returns The generated text response from Claude
 */
export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'claude-sonnet-4-5-20250929',
  maxTokens: number = 8000
): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract text content from all text blocks in the response
  const textParts = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text);

  return textParts.join('\n');
}

/**
 * Simple wrapper that uses default system instructions for LinkedIn content.
 *
 * @param prompt - The prompt to send to Claude
 * @returns The generated text response
 */
export async function callClaudeSimple(prompt: string): Promise<string> {
  return callClaude(
    'You are a helpful LinkedIn content strategist specializing in parenthood, workplace performance, and HR innovation.',
    prompt,
    'claude-3-5-sonnet-latest',
    4000
  );
}
