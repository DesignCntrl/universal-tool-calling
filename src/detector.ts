import type { Trigger, HardKeyword, ToolCall } from './types.js';
import { extractImageQuery, extractWebQuery, extractMemoryQuery, extractDocumentName, takeRest } from './extractors.js';

export const TRIGGERS: Trigger[] = [
  {
    tool: 'generate_image',
    patterns: [
      '(generate|create|make|draw|paint|show)\\s+(an?\\s+)?(image|picture|photo|illustration|drawing|portrait)\\s+(of\\s+)?',
    ],
    extract: extractImageQuery,
    confidence: 0.90,
  },
  {
    tool: 'web_search',
    patterns: [
      'search\\s+(the\\s+)?web\\s+(for\\s+)?',
      'what\\s+is\\s+the\\s+(latest|current|most\\s+recent)',
      '(find|look\\s+up|search)\\s+(for\\s+)?(news|headlines|recent)',
      'google\\s+',
    ],
    extract: extractWebQuery,
    confidence: 0.90,
  },
  {
    tool: 'search_memory',
    patterns: [
      'search\\s+(your\\s+)?memory\\s+(for\\s+)?',
      'recall\\s+(from\\s+memory\\s+)?',
    ],
    extract: extractMemoryQuery,
    confidence: 0.90,
  },
  {
    tool: 'list_documents',
    patterns: [
      '(list|show|display)\\s+(all\\s+)?(files|documents|vault)',
    ],
    extract: () => ({}),
    confidence: 0.90,
  },
  {
    tool: 'read_document',
    patterns: [
      '(read|open|show\\s+me)\\s+(file|document)\\s+',
    ],
    extract: extractDocumentName,
    confidence: 0.90,
  },
];

export const HARD_KEYWORDS: HardKeyword[] = [
  {
    keyword: 'generate an image',
    tool: 'generate_image',
    args: (text) => ({ prompt: text }),
    confidence: 0.95,
  },
  {
    keyword: 'create an image',
    tool: 'generate_image',
    args: (text) => ({ prompt: text }),
    confidence: 0.95,
  },
  {
    keyword: 'draw a',
    tool: 'generate_image',
    args: (text) => ({ prompt: text }),
    confidence: 0.95,
  },
  {
    keyword: 'search the web',
    tool: 'web_search',
    args: (text) => {
      const query = text
        .replace(/search\s+(the\s+)?web\s+(for\s+)?/i, '')
        .replace(/\b(for|about|the|on|please|can you)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return { query };
    },
    confidence: 0.95,
  },
  {
    keyword: 'recall from memory',
    tool: 'search_memory',
    args: (text) => ({ query: takeRest(text, text.toLowerCase().indexOf('recall from memory') + 'recall from memory'.length) || text }),
    confidence: 0.95,
  },
  {
    keyword: 'search memory',
    tool: 'search_memory',
    args: (text) => {
      const query = text
        .replace(/search\s+(your\s+)?memory\s+(for\s+)?/i, '')
        .trim();
      return { query };
    },
    confidence: 0.95,
  },
  {
    keyword: 'remember that',
    tool: 'search_memory',
    args: (text) => ({ query: text }),
    confidence: 0.95,
  },
  {
    keyword: 'list files',
    tool: 'list_documents',
    args: () => ({}),
    confidence: 0.95,
  },
  {
    keyword: 'list documents',
    tool: 'list_documents',
    args: () => ({}),
    confidence: 0.95,
  },
  {
    keyword: 'show me the vault',
    tool: 'list_documents',
    args: () => ({}),
    confidence: 0.95,
  },
];

export function detectNaturalTrigger(text: string): ToolCall | null {
  if (!text || !text.trim()) return null;

  const lowerText = text.toLowerCase();

  for (const kw of HARD_KEYWORDS) {
    if (lowerText.includes(kw.keyword)) {
      return {
        tool: kw.tool,
        args: kw.args(text),
        confidence: kw.confidence ?? 0.95,
        source: 'keyword',
      };
    }
  }

  for (const trigger of TRIGGERS) {
    for (const pattern of trigger.patterns) {
      const regex = new RegExp(pattern, 'i');
      const match = text.match(regex);
      if (match) {
        return {
          tool: trigger.tool,
          args: trigger.extract(match, text),
          confidence: trigger.confidence ?? 0.90,
          source: 'regex',
        };
      }
    }
  }

  return null;
}
