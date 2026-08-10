import type { ToolSchema } from './types.js';

export const LOCAL_TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an image from a text prompt. Use when user asks to draw, create, or show an image. Args: prompt (required).',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Image description. Example: "a cyberpunk cat on a neon rooftop"' },
        },
        required: ['prompt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information. Use when user asks about news, current events, facts, or anything not in local knowledge. Args: query (required).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query. Example: "Python 3.14 release notes"' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_memory',
      description: 'Search past conversations and stored knowledge. Use when user asks to recall, remember, or look up previous discussions. Args: query (required).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query. Example: "what we discussed about project X"' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_documents',
      description: 'List all saved documents in the vault. Use when user asks to see files, documents, or the vault. Args: none.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_document',
      description: 'Read a saved document by name. Use when user asks to open, read, or show a specific file. Args: name (required).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Document name. Example: "api-spec", "meeting-notes"' },
        },
        required: ['name'],
      },
    },
  },
];

export function formatToolsForPrompt(schemas: ToolSchema[], maxTools: number = 10): ToolSchema[] {
  return schemas.slice(0, maxTools);
}
